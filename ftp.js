const ftp = require("basic-ftp");
const fs = require("fs");
const path = require("path");

const config = {
  host: "xxxxxxxxxxxxxxxxxxxxxxxx",
  user: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  password: "xxxxxxxxxxxxxxxxxx",
  port: 21,
  localRoot: __dirname + "/build",
  remoteRoot: "/",
  include: ["*", ".htaccess"],
  exclude: ["images/**"],
  deleteRemote: false,
};

const ftpConfig = {
  host: config.host,
  user: config.user,
  password: config.password,
  secure: false,
};

const localBuildPath = "./dist";
const remoteDeployPath = "/";

async function deploy() {
  const client = new ftp.Client();

  // Function to update progress in the same line
  function updateProgress(message) {
    process.stdout.clearLine(0); // Clear the current line
    process.stdout.cursorTo(0); // Move cursor to the beginning of the line
    process.stdout.write(message); // Write the updated message
  }

  try {
    // Connect to the FTP server
    console.log("\x1b[33mConnecting to FTP server...\x1b[0m");
    await client.access(ftpConfig);
    console.log("\x1b[32mConnected Successfully!\n\x1b[0m");

    // Get the total size of files in the local build directory
    const totalSize = await getTotalSize(localBuildPath);
    console.log(`Total size to transfer: ${formatBytes(totalSize)}`);

    // Initialize the transferred bytes counter
    let transferredBytes = 0;

    // Function to recursively upload files
    async function uploadDirectory(localDir, remoteDir) {
      const files = await fs.promises.readdir(localDir, {
        withFileTypes: true,
      });

      for (const file of files) {
        const localPath = path.join(localDir, file.name);
        const remotePath = path.posix.join(remoteDir, file.name);

        if (file.isDirectory()) {
          // Create remote directory if it doesn't exist
          try {
            await client.ensureDir(remotePath);
          } catch (dirErr) {
            console.log(`Error creating directory ${remotePath}: ${dirErr}`);
          }

          // Recursively upload subdirectory
          await uploadDirectory(localPath, remotePath);
        } else {
          try {
            // Upload individual file
            await client.uploadFrom(localPath, remotePath);

            // Update transferred bytes and display progress
            const fileSize = (await fs.promises.stat(localPath)).size;
            transferredBytes += fileSize;

            const percentage = ((transferredBytes / totalSize) * 100).toFixed(
              2
            );

            // Update progress
            updateProgress(
              `Progress: ${percentage}% (${formatBytes(
                transferredBytes
              )}/${formatBytes(totalSize)})`
            );
          } catch (uploadErr) {
            console.log(`Error uploading ${file.name}: ${uploadErr}`);
          }
        }
      }
    }

    // Start the upload process
    await uploadDirectory(localBuildPath, remoteDeployPath);

    console.log(
      "\n\n\x1b[32mDeployment successful ! Thank you for your patience! 🚀\x1b[0m"
    );

  } catch (err) {
    console.log(`Error deploying the web: \x1b[31m${err}\x1b[0m`);
  } finally {
    // Close the FTP connection
    client.close();
  }
}

// Function to calculate the total size of files in a directory
async function getTotalSize(dir) {
  const fileStats = await fs.promises.stat(dir);
  if (fileStats.isFile()) {
    return fileStats.size;
  } else if (fileStats.isDirectory()) {
    const files = await fs.promises.readdir(dir);
    let totalSize = 0;
    for (const file of files) {
      totalSize += await getTotalSize(path.join(dir, file));
    }

    return totalSize;
  }

  return 0;
}

// Utility function to format bytes into human-readable format
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

deploy();
