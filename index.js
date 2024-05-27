const getMedian = (arr) => {
  arr.sort((a, b) => a - b);
  const half = Math.floor(arr.length / 2);
  if (arr.length % 2 === 0) return (arr[half - 1] + arr[half]) / 2.0;
  return arr[half];
};

const handleBarcode = (result) => {
  const errors = result.codeResult.decodedCodes
    .filter((_) => _.error !== undefined)
    .map((_) => _.error);
  console.log(getMedian(errors));
  if (getMedian(errors) < 0.1) {
    const barcode = result.codeResult?.code;
    if (!barcodeCounts[barcode]) {
      barcodeCounts[barcode] = 0; // Initialize the count for this barcode
    }
    barcodeCounts[barcode] += 1; // Increment the count

    if (barcodeCounts[barcode] > 5) {
      window.alert(`Barcode: ${barcode} is valid!`);
      barcodeCounts = {}; // Reset the count
    }
  } else {
    console.log('That looks a little sketchy my dude');
  }
};

const onProcessed = (result) => {
  if (result) {
    const drawingCtx = Quagga.canvas.ctx.overlay,
      drawingCanvas = Quagga.canvas.dom.overlay;

    if (result.boxes) {
      drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      result.boxes
        .filter(function (box) {
          return box !== result.box;
        })
        .forEach(function (box) {
          Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
            color: 'green',
            lineWidth: 2,
          });
        });
    }

    if (result.box) {
      Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
        color: 'blue',
        lineWidth: 2,
      });
    }

    if (result.codeResult) {
      drawingCtx.font = '24px Arial';
      drawingCtx.fillStyle = 'green';
      drawingCtx.fillText(result.codeResult.code, 10, 40);
      handleBarcode(result);
      return;
    }

    // Capture the frame and scan for QR codes
    const video = document.querySelector('video');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

    if (qrCode.code) {
      console.log(qrCode);
      window.alert('QR Code detected: ', qrCode.toString());
      console.log('QR Code detected: ', qrCode.data);
    }
  }
};
let barcodeCounts = {};

const onDetected = (result) => {
  if (result?.codeResult) {
    handleBarcode(result);
  }
};

document.addEventListener('DOMContentLoaded', (event) => {
  Quagga.init(
    {
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: document.querySelector('#scanner'),
        constraints: {
          width: window.innerWidth,
          facingMode: 'environment',
        },
      },
      decoder: {
        readers: [
          'upc_reader', // UPC-A
          'upc_e_reader', // UPC-E
          'ean_reader', // EAN-13
          'ean_8_reader', // EAN-8
          'code_39_reader', // Code 39
          'code_93_reader', // Code 93
          'code_128_reader', // Code 128
        ],
      },
    },
    function (err) {
      if (err) {
        console.log(err);
        return;
      }
      console.log('Init success');
      Quagga.start();

      // Quagga.onDetected(onDetected);
      Quagga.onProcessed(onProcessed);
    },
  );
});
