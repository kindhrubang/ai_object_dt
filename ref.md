CORS(Cross-Origin Resource Sharing) 문제는 웹 애플리케이션이 서로 다른 도메인, 포트, 또는 프로토콜에서 리소스를 요청할 때 발생하는 보안 메커니즘에서 비롯됩니다. 이는 기본적으로 브라우저에서 작동하며, 웹 페이지가 자바스크립트로서 다른 도메인으로 리소스를 요청할 때 이를 제어하는 방식입니다.

## 1. CORS의 동작 원리
CORS는 보안상의 이유로 **다른 출처(Origin)**로부터 리소스를 요청하는 것을 기본적으로 차단합니다. 예를 들어, 브라우저에서 실행되는 웹 애플리케이션이 http://example.com 도메인에 있지만, 이 애플리케이션이 http://api.example2.com에 있는 API를 호출하려고 할 때 CORS 정책이 개입합니다. 다른 출처로의 요청은 잠재적으로 위험하다고 간주되어 브라우저가 자동으로 차단할 수 있습니다.

여기서 출처(Origin)는 다음 세 가지로 정의됩니다:
- 도메인(domain)
- 프로토콜(protocol) (http, https)
- 포트(port)

즉, 출처가 다르다고 판단되는 경우라면 브라우저는 CORS 정책을 적용합니다.

## 2. CORS 문제의 원인
다음의 경우 브라우저가 CORS 문제를 발생시킬 수 있습니다:
- React 앱이 localhost:3000에서 실행되고, API 서버는 localhost:5000에서 실행되는 경우. 이 경우 도메인은 같지만, 포트 번호가 다르므로 출처가 다르다고 간주됩니다.
- 웹 애플리케이션이 http://example.com에서 실행되는데, 자바스크립트로 http://api.example2.com에서 데이터를 가져오려고 하면, 출처가 다르기 때문에 CORS 정책에 의해 차단됩니다.

## 3. CORS 문제 해결 방법

1. Node.js에서 CORS 설정
Node.js에서 CORS를 허용하기 위해서는 cors 미들웨어를 사용할 수 있습니다. Express.js와 함께 cors 라이브러리를 사용하여 간단하게 CORS 문제를 해결할 수 있습니다.
2. React의 proxy 설정
React에서는 개발 환경에서 Node.js 서버로의 API 요청을 프록시하는 방법도 있습니다. React의 package.json 파일에 proxy 속성을 추가하면, 브라우저는 교차 출처 요청을 하지 않고, React 개발 서버가 Node.js 서버로 요청을 프록시합니다.
이 설정을 통해 React는 localhost:3000에서 실행되지만, API 요청을 Node.js 서버(localhost:5000)로 프록시하여 CORS 문제를 피할 수 있습니다.

3. Nginx 리버스 프록시 사용
프로덕션 환경에서는 Nginx 같은 리버스 프록시 서버를 사용하여, 동일한 도메인 및 포트에서 React와 Node.js 서버를 통합할 수 있습니다. 이렇게 하면 CORS 문제가 발생하지 않습니다. Nginx가 모든 요청을 받아서 React 애플리케이션과 Node.js API 서버로 라우팅하도록 설정하면, 두 서버가 동일한 출처에 있는 것처럼 동작하게 됩니다.
