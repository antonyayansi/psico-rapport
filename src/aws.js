import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({
    region: import.meta.env.VITE_AWS_REGION,
    credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    },
    maxAttempts: 3,
});

const BUCKET = import.meta.env.VITE_AWS_BUCKET_NAME;

/**
 * Sube un archivo al directorio de posts: uwuapp/posts/<fileName>
 */
const uploadPostImage = async (fileName, file) => {
    const key = `uwuapp/posts/${fileName}`;
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: await file.arrayBuffer(),
        ContentType: file.type,
    });
    try {
        await client.send(command);
        return key;
    } catch (err) {
        console.error('Error al subir imagen de post:', err);
        throw err;
    }
};

/**
 * Sube un archivo al directorio de perfiles: uwuapp/profiles/<fileName>
 */
const uploadProfileImage = async (fileName, file) => {
    const key = `uwuapp/profiles/${fileName}`;
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: await file.arrayBuffer(),
        ContentType: file.type,
    });
    try {
        await client.send(command);
        return key;
    } catch (err) {
        console.error('Error al subir foto de perfil:', err);
        throw err;
    }
};

/**
 * Elimina un archivo de S3 dado su key completo (ej: "uwuapp/posts/xxx.jpg")
 * Si se pasa una URL completa, extrae automáticamente el key.
 */
const deleteFileFromS3 = async (keyOrUrl) => {
    // Si se pasa la URL completa, extraer solo el key a partir de "uwuapp/"
    let key = keyOrUrl;
    if (keyOrUrl.startsWith('http')) {
        const match = keyOrUrl.match(/uwuapp\/.+/);
        if (match) key = match[0];
    }

    const command = new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
    });
    try {
        await client.send(command);
    } catch (error) {
        console.error('Error al eliminar el archivo:', error);
        throw error;
    }
};

export {
    uploadPostImage,
    uploadProfileImage,
    deleteFileFromS3,
    client,
};
