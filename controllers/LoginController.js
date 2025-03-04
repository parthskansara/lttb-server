import dotenv from "dotenv";
import getAuthUrl from "../services/auth.service.js";
import config from "../config/auth.config.js";

dotenv.config();

const clientId = process.env.CLIENT_ID;

const getUrl = async (req, res) => {
  const { targetUrl, codeVerifier } = await getAuthUrl();
  let finalUrl = targetUrl;
  if (req.session && req.session.spotify && req.session.spotify.accessToken) {
    try {
      finalUrl = `${config.clientUrl}/user`;
    } catch (err) {
      console.error("Error in LoginController: ", err);
    }
  } else {
    req.session.spotify = {
      codeVerifier: codeVerifier,
    };
    await req.session.save();
  }

  res.status(200).json({ url: finalUrl });
};

const logOut = async (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error logging out: ", err);
        return res
          .status(400)
          .json({ message: "Unable to log out, try again!" });
      }
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
      console.log("Logout successful");
      return res.status(200).json({ message: "Logout successful" });
    });
  } else {
    res.end();
  }
};

export default { getUrl, logOut };
