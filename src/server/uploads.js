const fs = require("fs/promises");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

async function saveUploadedFile(file) {
  const uploadDir = path.join(
    process.cwd(),
    process.env.UPLOAD_DIR || "public/uploads",
  );

  await fs.mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name || "");
  const filename = `${uuidv4()}${ext}`;
  const filePath = path.join(uploadDir, filename);
  const bytes = await file.arrayBuffer();

  await fs.writeFile(filePath, Buffer.from(bytes));

  return {
    filename,
    storedPath: filePath,
    publicUrl: `/uploads/${filename}`,
  };
}

module.exports = { saveUploadedFile };
