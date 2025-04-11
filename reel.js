export default async function(video_url, type = 'instagram') {
const response = await fetch('https://apihut.in/api/download/videos', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    'X-Avatar-Key': 'avatarhubadmin'
    },
    body: JSON.stringify({
    video_url,
    type,
    // user_id: ""
    })
});

    const result = await response.json();
    return result
}