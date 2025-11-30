
const API_KEY = process.env.DEVUPLOADS_KEY;

export async function getUploadServer() {
    const res = await fetch(`https://devuploads.com/api/upload/server?key=${API_KEY}`);
    if (!res.ok) {
        throw new Error('Failed to get upload server');
    }
    const data = await res.json();
    if (data.status !== 200) {
        throw new Error(data.msg || 'Failed to get upload server');
    }
    return {
        url: data.result,
        sess_id: data.sess_id
    };
}
