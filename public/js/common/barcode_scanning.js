const formats = [
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.UPC_A
];
const config = {
    fps: 10,
    qrbox: { width: 250, height: 250 }
};
const html5QrCode = new Html5Qrcode(
    "scannerWindow"//,
    // { formatsToSupport: formats },
    // /* verbose= */ true
);
function StopScanning() {
    html5QrCode.stop()
    .catch(err => console.error(err));
}
function StartScanning(onSuccess) {
    html5QrCode.start(
        { facingMode: "environment" },
        config,
        onSuccess
    )
    .catch(err => console.error(err));
    // Html5Qrcode.getCameras()
    // .then(devices => {
    //     if (devices && devices.length) {
    //         html5QrCode.start(
    //             { facingMode: "environment" },
    //             config,
    //             onSuccess
    //         );
    //     }
    // })
    // .catch(err => console.error(err));
};