const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const Admin = require("../models/Admin");

dotenv.config();

const jwtSecretKey = process.env.ACCESS_TOKEN_SECRET;
const refreshSecretKey = process.env.REFRESH_TOKEN_SECRET;

const refreshAccessToken = async (req, res) => {
    try {
      const cookies = req.cookies;
      //console.log("cookies: ", cookies.jwt);
      if (!cookies?.jwt) {
        return res.status(401).json({ error: 'Refresh token not found' });
      }
  
      const refreshToken = cookies.jwt;
      const admins = await findAllAdmins();
      //console.log(admins);
      if (!admins || admins.length === 0) {
        return res.status(500).json({ error: 'Admin data not found' });
      }
  
      const foundAdmin = admins.find((admin) => admin.refreshToken.toString() == refreshToken);
  
  
  
      if (!foundAdmin) {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }
  
  
      jwt.verify(refreshToken, refreshSecretKey, (err, decoded) => {
        if (err || foundAdmin.username !== decoded.admin) {
          return res.status(403).json({ error: 'Invalid refresh token or admin mismatch' });
        }
  
        // Generate a new access token
  
        const accessToken = jwt.sign({ admin: foundAdmin.username }, jwtSecretKey, { expiresIn: '30s' });
  
        // Respond with the new access token
        res.json({ accessToken });
      });
    } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  const updateRefreshToken = async (req, res) => {
    console.log(req.params);
    const adminId = req.params.id;
    console.log(adminId);
    const { refreshToken } = req.body;
  
    try {
      // Update the admin in the database with the new refresh token
      const updatedAdmin = await Admin.findByIdAndUpdate(adminId, { refreshToken }, { new: true });
  
      if (!updatedAdmin) {
        return res.status(404).json({ error: 'Admin not found' });
      }
  
      // Respond with a success message or appropriate response
      return res.json({ message: 'Refresh token updated successfully' });
    } catch (error) {
      console.error('Error updating refreshToken in the database:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async function findAllAdmins() {
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

  module.exports = {
    refreshAccessToken,
    updateRefreshToken
  };