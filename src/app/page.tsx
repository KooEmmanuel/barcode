"use client";

import React, { useState } from 'react';
import { useBarcode } from 'react-barcodes';
// @ts-expect-error: file-saver doesn't have type definitions
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, Barcode } from 'lucide-react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full opacity-20"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 200 - 100],
              x: [0, Math.random() * 200 - 100],
              scale: [1, Math.random() + 0.5],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>
    </div>
  );
};

const BarcodeGenerator: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [barcodes, setBarcodes] = useState<string[]>([]);

  const generateBarcode = () => {
    const newBarcodes = Array.from({ length: quantity }, () => 
      Math.floor(1000000 + Math.random() * 9000000).toString()
    );
    setBarcodes(newBarcodes);
  };

  const downloadBarcodes = () => {
    const zip = new JSZip();
    barcodes.forEach((code, index) => {
      const canvas = document.getElementById(`barcode-${index}`) as HTMLCanvasElement;
      if (canvas) {
        const imageData = canvas.toDataURL('image/png');
        zip.file(`${productName}-${code}.png`, imageData.split(',')[1], { base64: true });
      }
    });
    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, `${productName}-barcodes.zip`);
    });
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(barcodes.map((code, index) => ({ 
      'Product Name': productName,
      'Barcode': code,
      'Serial Number': index + 1
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Barcodes');
    XLSX.writeFile(wb, `${productName}-barcodes.xlsx`);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <AnimatedBackground />
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden"
      >
        <div className="p-6 lg:p-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Barcode Generator</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700">Product Name</label>
              <input
                id="productName"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
              />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                id="quantity"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                min={1}
              />
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateBarcode}
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-md flex items-center justify-center"
          >
            <Barcode className="mr-2" size={18} />
            Generate Barcodes
          </motion.button>
        </div>
        
        {barcodes.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.5 }}
            className="bg-gray-100 p-6 lg:p-8"
          >
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadBarcodes}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-md flex items-center"
              >
                <Download className="mr-2" size={18} />
                Download Barcodes
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadExcel}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-md shadow-md flex items-center"
              >
                <FileSpreadsheet className="mr-2" size={18} />
                Download Excel
              </motion.button>
            </div>
            <h2 className="text-xl font-semibold mb-4 text-center">Generated Barcodes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {barcodes.map((code, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white border rounded-lg p-4 shadow-md"
                >
                  <BarcodeImage value={code} id={`barcode-${index}`} />
                  <p className="mt-2 text-sm text-center text-gray-600">{code}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

const BarcodeImage: React.FC<{ value: string; id: string }> = ({ value, id }) => {
  const { inputRef } = useBarcode({
    value,
    options: {
      background: '#ffffff',
      width: 2,
      height: 100,
      fontSize: 14,
    },
  });

  return <canvas ref={inputRef} id={id} className="mx-auto" />;
};

export default BarcodeGenerator;