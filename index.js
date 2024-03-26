require('dotenv').config();
const express = require("express");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const app = express();
const port = 3000;

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

async function getObjectURL(key) {
  const params = {
    Bucket: "bucket-name",
    Key: key,
  };

  try {
    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // Expires in 1 hour
    return url;
  } catch (error) {
    console.error("Error creating signed URL", error);
    throw error; // Rethrow the error so the caller can handle it
  }
}

app.get("/", async (req, res) => {
  try {
    const imageUrl = await getObjectURL("test.png");
    console.log(imageUrl);
    res.send(`<img src="${imageUrl}" alt="The S3 image">`);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
