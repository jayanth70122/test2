document.getElementById('uploadButton').addEventListener('click', async () => {
    const output = document.getElementById('output');
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a .hex file to upload.');
        return;
    }

    try {
        const device = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x0D28 }] }); // BBC micro:bit
        output.textContent = `Device selected: ${device.productName}`;
        await device.open();
        output.textContent += `\nDevice opened.`;
        await device.selectConfiguration(1);
        output.textContent += `\nConfiguration selected.`;
        await device.claimInterface(0);
        output.textContent += `\nInterface claimed.`;

        const arrayBuffer = await file.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);

        const endpointNumber = 2;
        const chunkSize = 64;

        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            await device.transferOut(endpointNumber, chunk);
            output.textContent += `\nTransferred ${chunk.length} bytes.`;
        }

        await device.close();
        output.textContent += `\nDevice closed.`;
        alert('File uploaded successfully!');
    } catch (error) {
        output.textContent = `Error: ${error.message}`;
        console.error(error);
    }
});
