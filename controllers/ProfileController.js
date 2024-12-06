
const getProfile = async(req, res) => {
    const accessToken = req.params.access_token; // TODO: Access from session instead of req
    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    })

    const data = await response.json();
    console.log(data);
    res.status(200).json(data);

}

export default { getProfile }