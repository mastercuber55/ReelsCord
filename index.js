async function downloadVideo(videoUrl, type = 'instagram') {
  const response = await fetch('https://apihut.in/api/download/videos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Avatar-Key': 'avatarhubadmin'
    },
    body: JSON.stringify({
      video_url: videoUrl,
      type: type,
      user_id: ""
    })
  });

  const result = await response.json();
  console.log(result);
}

downloadVideo('https://www.instagram.com/reel/DDi1xKkyBHQ');
