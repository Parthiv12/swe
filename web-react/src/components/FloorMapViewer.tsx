/**
 * FloorMapViewer Component - PDF Floor Map Display
 * 
 * Displays building floor maps from PDF files with page navigation
 * Falls back to demo view if PDF not available
 */

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import DemoFloorMap from './DemoFloorMap';

// Setup PDF.js worker - use local worker from node_modules
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();
  } catch (e) {
    console.warn('Could not load PDF worker, will use demo mode:', e);
  }
}

interface Props {
  buildingName: string;
  pdfPath: string;
  onClose: () => void;
}

export default function FloorMapViewer({ buildingName, pdfPath, onClose }: Props) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    setError(false);
    setLoading(false);
  }

  function onDocumentError(error: any) {
    console.error('PDF load error:', error);
    setError(true);
    setLoading(false);
  }

  function changePage(offset: number) {
    setPageNumber((prev) => Math.max(1, Math.min(prev + offset, numPages)));
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{buildingName} - Floor Maps</h3>
          <button onClick={onClose} className="small">✕ Close</button>
        </div>
        <div className="modal-body">
          {error ? (
            // Fallback: Show demo floor map when PDF fails
            <DemoFloorMap buildingName={buildingName} floorNumber={pageNumber} totalFloors={numPages || 4} onClose={onClose} />
          ) : (
            // Try to load PDF
            <>
              <div className="pdf-controls">
                <button onClick={() => changePage(-1)} disabled={pageNumber <= 1} className="small">
                  ← Prev
                </button>
                <span className="text-muted text-sm">
                  Floor {pageNumber} of {numPages}
                </span>
                <button onClick={() => changePage(1)} disabled={pageNumber >= numPages} className="small">
                  Next →
                </button>
              </div>
              <div className="pdf-page">
                <Document
                  file={pdfPath}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onError={onDocumentError}
                  loading={<div className="text-muted p-5">Loading floor maps...</div>}
                >
                  <Page 
                    pageNumber={pageNumber} 
                    width={800}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
