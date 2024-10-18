// import { S3 } from '@aws-sdk/client-s3'
// import { Upload } from '@aws-sdk/lib-storage'
// import * as fs from 'fs'

// export const s3 = new S3({
//   region: process.env.AWS_REGION!,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
//   }
// })

// // export const listBuckets = async () => {
// //   await s3
// //     .listBuckets()
// //     .then((res) => console.log(res.Buckets))
// //     .catch((err) => console.log(`Error listing buckets: ${err.code}`))
// // }

// // export const createBucket = async (bucketName: string) => {
// //   await s3
// //     .createBucket({ Bucket: bucketName })
// //     .then((res) => console.log(res))
// //     .catch((err) => console.log(`Error creating buckets: ${err.code}`))
// // }

// export const uploadFile = async (
//   bucketName: string,
//   filePath: string,
//   key: string
// ) => {
//   try {
//     const fileStream = fs.createReadStream(filePath)
//     const upload = new Upload({
//       client: s3,
//       params: {
//         Bucket: bucketName,
//         Key: key,
//         Body: fileStream
//       }
//     })

//     upload.on('httpUploadProgress', (progress) => {
//       console.log(progress)
//     })

//     await upload.done()
//     console.log(`File uploaded successfully to ${bucketName}/${key}`)
//   } catch (err) {
//     console.log(`Error uploading file: ${err}`)
//   }
// }
import { S3 } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

export const s3 = new S3({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

export const uploadFile = async (
  bucketName: string,
  fileBuffer: Buffer,
  key: string
): Promise<string | undefined> => {
  try {
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer
      }
    })

    upload.on('httpUploadProgress', (progress) => {
      console.log(progress)
    })

    const result = await upload.done()
    console.log(`File uploaded successfully to ${bucketName}/${key}`)
    return result.Location
  } catch (err) {
    console.error('Error uploading file:', err)
    throw err
  }
}
