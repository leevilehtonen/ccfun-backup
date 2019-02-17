# ccfun-backup
Simple backup software which periodically backups given path to AWS S3

## Design
Application has been built with Typescript, node.js and AWS SDK. After the project has been built by running:
```ts
npm run build
```
The backup application can be run with following command:
```ts
npm start path-to-directory interval bucket
//example:npm start /Users/name/folder 100 backup-bucket
```
where 
- *directory-to-folder* is location of the directory which the application will be looking for files to backup
- *interval* is time period in seconds how often files will be checked
- *bucket* is the name of the bucket where the modified files will be stored

In addition to these the application expects that the credentials to user who has access to the specified bucket are stored in `.aws/credentials` under profile `[school]`.

### Logic

Logic of the application is very simple. After the specified interval has gone, application will check all the files in the specified directory, and for all the files which have been modified during the last interval, the application will upload a new version to the specified S3 bucket. As the bucket is configured to enable versioning, all the versions of the files will be availble in the bucket. This is being repeated after every interval.

## AWS S3 Configuration
AWS S3 bucket has been created with default recommended settings. In addition to recommended settings:
- Versioning has been enabled in the Properties tab in AWS S3 console. This allows all the versions to be saved in same bucket.
- Lifecycle rule has been added to previous versions in the Management tab in AWS S3 console. This will move all the previous versions of the objects to the Glacier storage.