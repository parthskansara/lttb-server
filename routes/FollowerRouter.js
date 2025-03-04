import express from "express";
import { spawn } from "child_process";

import {
  createOrUpdateUser,
  getUserByUserId,
} from "../services/user.service.js";

import { scrapePage } from "../services/scraper.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    if (!req.session?.spotify?.user_id) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const user_id = req.session.spotify.user_id;
    const shouldRefresh = req.query.refresh === "true";

    console.log("Getting followers for user id: ", user_id);
    const userObject = await getUserByUserId(user_id);
    const user = userObject.toObject();

    if (user?.followers?.length > 0 && !shouldRefresh) {
      // console.log("Fetched followers in FollowerRouter", user.followers);
      return res.status(200).json(user.followers);
    } else {
      const data = await scrapePage(user_id);
      const parsedData = JSON.parse(data);

      if (user) {
        const userData = {
          ...user,
          followers: parsedData,
        };
        console.log("Updating user from FollowerRouter");
        await createOrUpdateUser(userData);
      }

      res.status(200).json(parsedData);

      // const python_process = spawn("python", ["services/scraper.py", user_id]);
      // let data_from_python = "";
      // python_process.stdout.on("data", (data) => {
      //   data_from_python += data.toString();
      // });
      // python_process.stderr.on("data", (data) => {
      //   console.error(`Python script error: ${data}`);
      // });
      // python_process.on("close", async (code) => {
      //   console.log(`Python script exited with code ${code}`);
      //   let parsedData = JSON.parse(data_from_python);

      //   if (user) {
      //     const userData = {
      //       ...user,
      //       followers: parsedData,
      //     };
      //     console.log("Updating user from FollowerRouter");
      //     await createOrUpdateUser(userData);
      //   }

      //   res.status(200).json(parsedData);
      // });
    }
  } catch (error) {
    console.error("Error in follower route: ", error);
    res
      .status(500)
      .json({ error: "An error occured while processing this request" });
  }
});

export default router;
