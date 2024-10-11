# 웨이퍼 결함 검출 시스템

## 프로젝트 개요
이 프로젝트는 웨이퍼 이미지에서 결함을 자동으로 검출하는 시스템을 구현합니다. Flask 백엔드와 React 프론트엔드를 사용하여 사용자 친화적인 웹 인터페이스를 제공합니다.

## 프로젝트 구조
SEMICD_V2/
│
├── backend/
│   ├── app.py
│   ├── best.pt
│   └── requirements.txt
│
├── frontend/
│   ├── node_modules/
│   │   ├── ...  (많은 하위 디렉토리와 파일들)
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── myenv/
│
└── README.md

## 주요 기능
1. 웨이퍼 이미지 업로드
2. YOLOv8 모델을 이용한 결함 검출
3. 검출 결과 시각화
4. 결함 유형 및 위치 정보 제공

## 개발 단계 구성

### Flask 서버 (백엔드)
- 웨이퍼 이미지 처리 및 YOLOv8 모델을 이용한 결함 검출
- RESTful API 엔드포인트 제공

### React 개발 서버 (프론트엔드)
- 사용자 인터페이스 제공
- 이미지 업로드 및 결과 표시 기능

## 설정 및 실행 방법

### Flask 서버 설정 (백엔드)
1. 프로젝트 디렉토리로 이동
2. 가상 환경 생성 및 활성화
   ```bash
   python -m venv myenv
   source myenv/bin/activate  # Windows의 경우: myenv\Scripts\activate
   ```
3. 필요한 패키지 설치
   ```bash
   pip install flask flask-cors ultralytics pillow
   ```
4. app.py 작성
   ```python
   from flask import Flask, request, jsonify
   from flask_cors import CORS
   from ultralytics import YOLO
   from PIL import Image
   import io
   import base64
   import traceback

   app = Flask(__name__)
   CORS(app)

   model = YOLO('best.pt')

   @app.route('/detect', methods=['POST'])
   def detect():
       try:
           image_data = request.json['image']
           image_data = base64.b64decode(image_data.split(',')[1])
           image = Image.open(io.BytesIO(image_data))
           
           results = model(image)
           
           detections = []
           for result in results:
               boxes = result.boxes.xyxy.tolist()
               classes = result.boxes.cls.tolist()
               for box, cls in zip(boxes, classes):
                   detections.append({
                       'box': box,
                       'class': int(cls)
                   })
           
           return jsonify({'detections': detections})
       except Exception as e:
           return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

   if __name__ == '__main__':
       app.run(debug=True)
   ```
5. best.pt 파일 추가 (YOLOv8 모델 파일)

6. 프로젝트 디렉토리에서 다음 명령어를 실행하여 Flask 서버 실행
   ```bash
   python app.py
   ```

### React 개발 서버 설정 (프론트엔드)
1. React 앱 생성 및 패키지 설치
   ```bash
   npx create-react-app client
   cd client
   npm install react-bootstrap bootstrap axios
   ```
2. package.json 수정
   - node_modules와 package-lock.json 삭제 후 npm install 실행
   - proxy 설정: package.json에 다음 줄 추가
     ```json
     "proxy": "http://localhost:5000"
     ```

3. App.js 작성
   ```jsx
   import React, { useState } from 'react';
   import axios from 'axios';
   import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
   import 'bootstrap/dist/css/bootstrap.min.css';

   function App() {
     const [image, setImage] = useState(null);
     const [results, setResults] = useState(null);

     const handleImageUpload = (e) => {
       const file = e.target.files[0];
       const reader = new FileReader();
       reader.onloadend = () => {
         setImage(reader.result);
       };
       reader.readAsDataURL(file);
     };

     const handleDetect = async () => {
       try {
         const response = await axios.post('/detect', { image });
         setResults(response.data.detections);
       } catch (error) {
         console.error('Error detecting defects:', error);
       }
     };

     return (
       <Container className="mt-5">
         <h1 className="text-center mb-4">웨이퍼 결함 검출 시스템</h1>
         <Row>
           <Col md={6}>
             <Card>
               <Card.Body>
                 <Form.Group>
                   <Form.Label>웨이퍼 이미지 업로드</Form.Label>
                   <Form.Control type="file" onChange={handleImageUpload} />
                 </Form.Group>
                 <Button variant="primary" onClick={handleDetect} className="mt-3">
                   결함 검출
                 </Button>
               </Card.Body>
             </Card>
           </Col>
           <Col md={6}>
             <Card>
               <Card.Body>
                 <h5>검출 결과</h5>
                 {results && (
                   <ul>
                     {results.map((detection, index) => (
                       <li key={index}>
                         클래스: {detection.class}, 
                         위치: ({detection.box[0]}, {detection.box[1]}) - ({detection.box[2]}, {detection.box[3]})
                       </li>
                     ))}
                   </ul>
                 )}
               </Card.Body>
             </Card>
           </Col>
         </Row>
       </Container>
     );
   }

   export default App;
   ```
### react-icons 설치

npm install react-icons


4. 프로젝트 디렉토리에서 다음 명령어를 실행하여 React 개발 서버 실행
   ```bash
   npm start
   ```

## 구성 요소 간 관계

### React 클라이언트 (http://localhost:3000)
- 사용자 인터페이스를 제공합니다.
- 이미지 업로드 및 검출 요청을 처리합니다.
- 검출 결과를 시각화합니다.

### Flask 서버 (http://localhost:5000)
- /detect 엔드포인트를 통해 이미지 처리 및 결함 검출 서비스를 제공합니다.
- YOLOv8 모델을 사용하여 웨이퍼 이미지의 결함을 검출합니다.
- 검출 결과를 JSON 형식으로 반환합니다.

## 프록시 설정
- React 개발 서버의 프록시 설정을 통해 CORS 이슈를 해결합니다.
- 클라이언트의 API 요청을 Flask 서버로 자동으로 전달합니다.

## 배포 고려사항
- 프로덕션 환경으로 전환 시, React 앱을 빌드하고 정적 파일을 서빙하는 서버(예: Express 또는 Nginx)를 추가하여 배포할 수 있습니다.
- 보안을 위해 HTTPS 프로토콜 사용을 고려해야 합니다.
- 대용량 이미지 처리를 위한 서버 리소스 최적화가 필요할 수 있습니다.

## 향후 개선 사항
1. 결함 유형별 통계 기능 추가
2. 사용자 인증 및 권한 관리 시스템 구현
3. 실시간 웨이퍼 이미지 스트리밍 및 검출 기능 추가
4. 검출 결과 데이터베이스 저장 및 이력 관리 기능

이 시스템을 통해 웨이퍼 제조 공정에서의 품질 관리를 자동화하고 효율성을 높일 수 있습니다.