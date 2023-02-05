const html5QrCode = new Html5Qrcode("reader");
function StopScanning() {
    html5QrCode.stop().then(ignore => {})
    .catch(err => console.log(err));
}
function StartScanning(func) {
    Html5Qrcode.getCameras().then(devices => {
        if (devices && devices.length) {
            html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    formatsToSupport: [
                        Html5QrcodeSupportedFormats.CODE_128,
                        Html5QrcodeSupportedFormats.EAN_8,
                        Html5QrcodeSupportedFormats.EAN_13,
                        Html5QrcodeSupportedFormats.UPC_A
                    ]
                },
                (decodedText, decodedResult) => func(decodedText),
                err => console.log(err)
            );
        }
    }).catch(err => console.log(err));
};