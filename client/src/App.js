import React, { useState, useRef } from 'react';
import { Container, Row, Col, Card, Form, Badge, Alert, Button, Table } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setFiles(uploadedFiles);
  };

  const handleDetect = async () => {
    if (files.length === 0) {
      setError("이미지를 먼저 업로드해주세요.");
      return;
    }

    setResults([]);
    setError(null);

    for (let i = 0; i < files.length; i++) {
      try {
        const formData = new FormData();
        formData.append('file', files[i]);

        const response = await fetch('/detect', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server response:', errorText);
          throw new Error(`서버 응답 오류: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        setResults(prevResults => [...prevResults, data]);
      } catch (error) {
        console.error('이미지 검출 중 오류 발생:', error);
        setError(`이미지 처리 중 오류가 발생했습니다: ${error.message}`);
      }
    }
  };

  const handleReset = () => {
    setResults([]);
    setError(null);
    setFiles([]);
    setCurrentIndex(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getDetectionSummary = (detections) => {
    const defectCounts = {};
    let totalDefects = 0;

    detections.forEach(detection => {
      if (detection.class !== 'normal') {
        defectCounts[detection.class] = (defectCounts[detection.class] || 0) + 1;
        totalDefects++;
      }
    });

    return { defectCounts, totalDefects };
  };

  const renderResult = (result, index) => {
    return (
      <div key={index}>
        <Row className="justify-content-center">
          <Col md={4} className="d-flex justify-content-center">
            <Card className="h-100 w-100">
              <Card.Header className="text-center font-weight-bold">웨이퍼 이미지 {index + 1}</Card.Header>
              <Card.Body className="d-flex align-items-center justify-content-center">
                <img src={`data:image/png;base64,${result.image}`} alt={`검출 결과 ${index + 1}`} className="img-fluid" />
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="d-flex justify-content-center">
            <Card className="h-100 w-100">
              <Card.Header className="text-center font-weight-bold">검사 결과 요약 {index + 1}</Card.Header>
              <Card.Body>
                <div className="text-center w-100">
                  <h4>검사 결과 : {'   '}
                    <Badge bg={result.detections.some(d => d.class !== 'normal') ? 'danger' : 'success'}>
                      {result.detections.some(d => d.class !== 'normal') ? 'Fail' : 'Success'}
                    </Badge>
                  </h4>
                  {result.detections.some(d => d.class !== 'normal') && (
                    <>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>결함 유형</th>
                            <th>개수</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(getDetectionSummary(result.detections).defectCounts).map(([defectType, count]) => (
                            <tr key={defectType}>
                              <td><strong>{defectType}</strong></td>
                              <td>{count}개</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      <h5>총 결함 개수: {getDetectionSummary(result.detections).totalDefects}개</h5>
                    </>
                  )}
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>객체 유형</th>
                        <th>신뢰도</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.detections.map((detection, index) => (
                        <tr key={index}>
                          <td><strong>{detection.class}</strong></td>
                          <td>신뢰도 {(detection.confidence * 100).toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div className="app-background">
      <Container className="mt-5 main-container">
        <h1 className="text-center mb-4 app-title">Semiconductor Wafer Defect Detection</h1>
        <div className="d-flex justify-content-center mb-3">
          <Form.Group controlId="formFile" className="me-2" style={{ flexBasis: '55%' }}>
            <Form.Control 
              type="file" 
              onChange={handleImageUpload} 
              accept="image/*" 
              multiple 
              className="custom-file-input"
              ref={fileInputRef}
            />
          </Form.Group>
          <div className="d-flex align-items-center">
            <Button onClick={handleDetect} className="me-2 custom-button">Detect</Button>
            <Button onClick={handleReset} variant="secondary" className="custom-button">Reset</Button>
          </div>
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        {results.length > 0 && (
          <div className="position-relative">
            <Button 
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="custom-button nav-button nav-button-left"
              aria-label="Previous"
            >
              <FaChevronLeft />
            </Button>
            {renderResult(results[currentIndex], currentIndex)}
            <Button 
              onClick={() => setCurrentIndex(prev => Math.min(results.length - 1, prev + 1))}
              disabled={currentIndex === results.length - 1}
              className="custom-button nav-button nav-button-right"
              aria-label="Next"
            >
              <FaChevronRight />
            </Button>
            <div className="text-center mt-3">
              <span className="result-counter">{currentIndex + 1} / {results.length}</span>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

export default App;