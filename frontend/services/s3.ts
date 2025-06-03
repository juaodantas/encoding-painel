export const s3 = {
    async uploadFile(url: string, file: File) {
        try {
            const response = await fetch(url, {
                method: 'PUT',
                mode: 'cors',
                headers: {
                    'Content-Type': file.type,
                },
                body: file,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

            // Verifica se o upload foi bem sucedido
            const etag = response.headers.get('ETag');
            if (!etag) {
                throw new Error('Upload verification failed: No ETag received');
            }

            return {
                success: true,
                etag,
                status: response.status,
                statusText: response.statusText
            };
        } catch (error) {
            console.error('Error uploading to S3:', error);
            throw error;
        }
    }
}