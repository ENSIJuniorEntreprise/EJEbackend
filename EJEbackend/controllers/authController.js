const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt")
const dotenv = require("dotenv");
const Admin = require("../models/Admin");

dotenv.config();

const jwtSecretKey = process.env.ACCESS_TOKEN_SECRET;
const refreshSecretKey = process.env.REFRESH_TOKEN_SECRET;

async function updateRefreshTokenInDatabase(adminId, refreshToken) {
  // console.log(adminId);
  // console.log(refreshToken);
  try {
    const response = await fetch(`http://localhost:${process.env.PORT}/refresh/${adminId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating refreshToken in the database:', error);
    throw error;
  }
}

async function updateAdminArray(admins) {
  try {
    const result = await Admin.updateOne({}, { admins: admins });
    return result;
  } catch (error) {
    console.error('Error updating admins array:', error);
    return null;
  }
}

async function findAdminByIdentifier(username) {
  try {
    const admin = await Admin.findOne({
      username: username
    });

    return admin ? admin.toObject() : null; // Convert Mongoose document to a plain JavaScript object
  } catch (error) {
    console.error('Error finding admin:', error);
    return null;
  }
}

async function findAllAdmins(req, res) {
  try {
    const admins = await Admin.find();
    if (admins !== null) {
      const updatedAdmins = admins.map((admin) => admin.toObject());

      return updatedAdmins;
    } else {
      return null;
    }
  } catch (error) {
    console.log('Error: ', error);
    return null;
  }
}

async function getAccounts(req, res) {
  try {
    const admins = await Admin.find();
    if (admins !== null) {
      const updatedAdmins = admins.map((admin) => {
        return {
          _id: admin._id, // Include the _id field
          fullName: admin.fullName
        };
      });

      return res.status(200).json(updatedAdmins);

    } else {
      return res.status(404).json({ message: 'No admins found' });
    }
  } catch (error) {
    console.log('Error: ', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}


const signup = async (req, res) => {
  try {
    const cookies = req.cookies;
    const refreshToken = cookies.jwt;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { fullName, username, password } = req.body;
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'admin already exists' });
    }

    const newAdmin = new Admin({
      fullName,
      username,
      password
    });

    await newAdmin.save();

    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'An error occurred while creating the admin' });
  }
}

const checkPassword = async (req, res) => {

  const { username, password } = req.body;

  try {
    const admin = await findAdminByIdentifier(username);
    if (!admin) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const isPasswordMatch = await bcrypt.compare(password, admin.password);
    if (isPasswordMatch) {
      return res.json({ currentAdmin: true });
    } else {
      return res.status(401).json({ currentAdmin: false });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

const login = async (req, res) => {
  const { username, password } = req.body;


  try {
    const admin = await findAdminByIdentifier(username);
    if (!admin) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const isPasswordMatch = await bcrypt.compare(password, admin.password);
    if (isPasswordMatch) {
      const accessToken = jwt.sign({ admin: username }, jwtSecretKey, { expiresIn: '10s' });
      const refreshToken = jwt.sign({ admin: username }, refreshSecretKey, { expiresIn: '1d' });

      let admins = await findAllAdmins();
      //const otherAdmins = admins.filter((admin) => admin.username === username;
      const currentAdmin = { ...admin, refreshToken };
      await updateRefreshTokenInDatabase(currentAdmin._id, refreshToken);
      // Save the updated admins array to the database
      const updatedAdmins = await updateAdminArray(admins);

      if (!updatedAdmins) {
        return res.status(500).json({ error: 'Failed to update admin data' });
      }

      res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 100 });

      return res.json({ currentAdmin: currentAdmin._id, accessToken });
    } else {
      return res.status(401).json({ error: 'Incorrect password' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

const logout = async (req, res) => {
  //delete access token in frontend
  const cookies = req.cookies;
  console.log(cookies);
  if (!cookies?.jwt) return res.sendStatus(204);
  const refreshToken = cookies.jwt;

  const admins = await findAllAdmins();
  const foundAdmin = admins.find((admin) => admin.refreshToken.toString() == refreshToken);


  console.log(foundAdmin);
  if (!foundAdmin) {
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 100 })
    return res.sendStatus(204);
  }

  await updateRefreshTokenInDatabase(foundAdmin._id, "");

  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 100 });
  res.sendStatus(204);
}

const getAccountInfo = async (req, res) => {
  try {
    // req.admin contains the username from the decoded JWT
    const { admin } = req;
    const accountInfo = await findAdminByIdentifier(admin);
    if (!accountInfo) {
      return res.status(404).json({ error: 'Admin account not found' });
    }

    // Extract the fullName attribute from the accountInfo object
    const { _id, fullName } = accountInfo;

    // Respond with only the fullName attribute
    res.json({ _id, fullName });
  } catch (error) {
    console.error('Error fetching account info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


const setAccountInfo = async (req, res) => {
  const adminId = req.params.identifier;
  const data = req.body;

  const sensitiveFields = ['username'];

  const filteredData = Object.keys(data).reduce((acc, key) => {
    if (!sensitiveFields.includes(key)) {
      acc[key] = data[key];
    }
    return acc;
  }, {});

  try {
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { $set: filteredData },
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    return res.json({ message: 'Admin data updated successfully' });
    console.log(data);
  } catch (error) {
    console.error('Error: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const deleteAccount = async (req, res) => {
  const adminId = req.params.id;
  console.log(adminId);

  try {
    const deletedAdmin = await Admin.findByIdAndDelete(adminId);

    if (!deletedAdmin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Optionally, perform additional cleanup or tasks related to deleting the account

    return res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  signup,
  login,
  checkPassword,
  logout,
  getAccountInfo,
  setAccountInfo,
  getAccounts,
  deleteAccount
}