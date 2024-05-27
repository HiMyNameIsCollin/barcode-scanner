document.addEventListener('DOMContentLoaded', (event) => {
  Quagga.init(
    {
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: document.querySelector('#scanner'),
        constraints: {
          width: window.innerWidth - 32,
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
      let barcodeCounts = {};
      const onDetected = (result) => {
        if (result?.codeResult) {
          const errors = result.codeResult.decodedCodes
            .filter((_) => _.error !== undefined)
            .map((_) => _.error);
          if (getMedian(errors) < 0.1) {
            const barcode = result.codeResult?.code;
            if (!barcodeCounts[barcode]) {
              barcodeCounts[barcode] = 0; // Initialize the count for this barcode
            }
            barcodeCounts[barcode] += 1; // Increment the count

            if (barcodeCounts[barcode] >= 10) {
              window.alert(`Barcode: ${barcode} is valid!`);
              barcodeCounts = {}; // Reset the count
            }
          } else {
            console.log('That looks a little sketchy my dude');
          }
        }
      };
      Quagga.onDetected(onDetected);
    },
  );
});
