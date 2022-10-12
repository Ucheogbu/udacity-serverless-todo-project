import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

const name = process.env.ATTACHMENT_S3_BUCKET
const expiresIn = process.env.SIGNED_URL_EXPIRATION


export function getAttachmentUrl(attachmentId: string): string {
    return `https://${name}.s3.amazonaws.com/${attachmentId}`
}

export async function createAttachmentUrl(id: string) {
    const uploadUrl = await s3.getSignedUrl('putObject', {
        Bucket: name,
        Key: id,
        Expires: Number(expiresIn)
    })
    return uploadUrl
}
