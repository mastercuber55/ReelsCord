export default async function(video_url, type = 'instagram') {
const response = await fetch(process.env.API, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    'X-Avatar-Key': 'avatarhubadmin'
    },
    body: JSON.stringify({
    video_url,
    type,
    })
});
    
    const result = await response.json();
    
    console.log(await fetch(video_url))
    
    return result
}