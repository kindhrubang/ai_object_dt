from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import io
import base64
import traceback
import os

app = Flask(__name__)
CORS(app)  

# 파일 크기 제한 설정 (16MB)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# YOLOv8 모델 로드
model_path = r'D:\kdt_240424\semicd\best.pt'
if not os.path.exists(model_path):
    raise FileNotFoundError(f"모델 파일을 찾을 수 없습니다: {model_path}")
model = YOLO(model_path)

@app.route('/detect', methods=['POST'])
def detect():
    try:
        if 'file' not in request.files:
            return jsonify({'error': '파일이 전송되지 않았습니다.'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': '선택된 파일이 없습니다.'}), 400
        
        try:
            img = Image.open(io.BytesIO(file.read()))
        except Exception as e:
            return jsonify({'error': f'파일을 읽는 중 오류 발생: {str(e)}'}), 400
        
        # 추론
        results = model(img)
        
        # 결과 처리
        detections = []
        for r in results:
            boxes = r.boxes
            for box in boxes:
                b = box.xyxy[0].tolist()
                conf = box.conf.item()
                cls = box.cls.item()
                detections.append({
                    'bbox': b,
                    'confidence': conf,
                    'class': model.names[int(cls)]
                })
        
        # 결과 이미지 생성
        result_img = results[0].plot()
        buffered = io.BytesIO()
        Image.fromarray(result_img).save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return jsonify({
            'detections': detections,
            'image': img_str
        })
    except Exception as e:
        error_msg = f"서버 오류 발생: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)  # 서버 콘솔에 출력
        return jsonify({'error': '서버에서 처리 중 오류가 발생했습니다. 관리자에게 문의하세요.'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
