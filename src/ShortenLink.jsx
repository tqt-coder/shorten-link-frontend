import React, { useState } from 'react';

function ShortenLink() {
    const [link, setLink] = useState('');
    const [shortLink, setShortLink] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    const handleGenerateShortLink = () => {
        const requestBody = {
            url: link
        };
        fetch(('/dev/generate-short-url'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                setShortLink(baseUrl + '/link/' + data.short_url_code);
                setShowPopup(true);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(shortLink);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    return (
        <>
            <h1 style={{ color: 'green' }}>Welcome to Shortenlink Pro!!</h1>
            <div className="wrapper">
                <label htmlFor="originalLink">Original Link</label>
                <input type="text" id="originalLink" value={link} onChange={e => setLink(e.target.value)} />
                <button onClick={handleGenerateShortLink}>Generate short Link</button>
            </div>

            {showPopup && (
                <div className="popup">
                    <p>Shorten Link: {shortLink}</p>
                    <button onClick={handleCopyToClipboard}>Copy to Clipboard</button>
                    <button onClick={handleClosePopup}>Close</button>
                </div>
            )}
        </>
    );
}

export default ShortenLink;

