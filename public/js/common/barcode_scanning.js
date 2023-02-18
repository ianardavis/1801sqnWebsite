const html5QrCode = new Html5Qrcode("scannerWindow");
const config = {
    fps: 10,
    // qrbox: { width: 250, height: 250 },
    formatsToSupport: [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.UPC_A
    ]
};
function StopScanning() {
    html5QrCode.stop()
    // .then(ignore => {})
    .catch(err => console.log(err));
}
function StartScanning(func) {
    Html5Qrcode.getCameras()
    .then(devices => {
        if (devices && devices.length) {
            html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText, decodedResult) => func(decodedText),
                err => console.log(err)
            )
            .then(result => console.log(result));
        }
    })
    .catch(err => console.log(err));
};