export const RequestPushMsg = (token, title, msg) => (firebase) => {
    const {
        config
    } = firebase;
    
    fetch(`https://${config.projectId}.web.app/send_notification`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "token": token,
            "title": title,
            "msg": msg
        })
    })
    .then((response) => {

    })
    .catch((error) => {
        console.log(error)
    });
}