function exportData() {
    const data = {
        message: "Here is the wallet comparison you'd asked for.",
        url: window.location.href
    };

    const shareUrl = `https://social-media-share.com?text=${encodeURIComponent(data.message)}&url=${encodeURIComponent(data.url)}`;

    window.open(shareUrl, '_blank');
}

// Attach the event listener
const exportButton = document.createElement('button');
exportButton.innerText = 'Export/Share';
exportButton.onclick = exportData;
document.querySelector('.container').appendChild(exportButton);