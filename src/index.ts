import { promisify } from "util"
import { join } from "path"
import { createReadStream, readdir, PathLike, statSync, Dirent } from "fs"
import moment from "moment"
import AWS from "aws-sdk"

AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: "school" })

// Get files which have been modified in the loacation during the last interval
const checkModified = async (location: PathLike, interval: number): Promise<Dirent[]> => {
  let files = await promisify(readdir)(location, { withFileTypes: true })
  files = files.filter(file => !file.isDirectory())
  files = files.filter(
    file => moment().diff(statSync(join(location as string, file.name)).mtimeMs, "seconds") < interval,
  )
  return files
}

// Promisified upload of file stream to s3
const backupFile = async (location: string, file: string, bucket: string) =>
  new AWS.S3({}).upload({ Bucket: bucket, Key: file, Body: createReadStream(join(location, file)) }).promise()

// Process
const run = async (location: string, interval: number, bucket: string) => {
  const files = await checkModified(location, interval)
  const uploads = files.map(file => backupFile(location, file.name, bucket))
  return Promise.all(uploads)
}

// Parse location path and the interval for checking directory changes
const location = process.argv[2]
const interval = Number(process.argv[3])
const bucket = process.argv[4]

if (location === undefined || location === null) {
  throw new Error("Location is not valid")
}
if (isNaN(interval) || interval < 3) {
  throw new Error("Interval is not valid")
}
if (bucket === undefined || bucket === null) {
  throw new Error("Bucket is not valid")
}

setInterval(() => {
  run(location, interval, bucket)
    .then(() => console.log(`Backup check ran at ${moment().format()}`))
    .catch(() => console.log("Backup process failed"))
}, interval * 1000)
