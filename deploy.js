import multer from "multer";
import AdmZip from "adm-zip";
import axios from "axios";
import fs from "fs";
import path from "path";

const upload = multer({ dest: "/tmp" });
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  upload.single("file")(req, {}, async (err) => {
    if (err) return res.status(500).json({ error: "Upload gagal" });

    try {
      // default pakai DitzyCreateWeb kalau user ga isi siteName
      const siteName = req.body.siteName || "DitzyCreateWeb";
      const filePath = req.file.path;

      const zip = new AdmZip(filePath);
      const extractPath = path.join("/tmp", siteName);
      zip.extractAllTo(extractPath, true);

      const files = [];
      function walk(dir) {
        fs.readdirSync(dir).forEach((file) => {
          const fullPath = path.join(dir, file);
          if (fs.lstatSync(fullPath).isDirectory()) {
            walk(fullPath);
          } else {
            const content = fs.readFileSync(fullPath);
            files.push({
              file: fullPath.replace(extractPath + "/", ""),
              data: content.toString(),
            });
          }
        });
      }
      walk(extractPath);

      const response = await axios.post(
        "https://api.vercel.com/v13/deployments",
        {
          name: siteName,
          files,
        },
        {
          headers: {
            Authorization: `Bearer ${VERCEL_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      res.status(200).json({ success: true, url: response.data.url });
    } catch (error) {
      console.error(error.response?.data || error.message);
      res.status(500).json({ error: "Gagal deploy ke Vercel" });
    }
  });
                    }
