/* ============================================================
   data.js  –  한국현 (Kuk-Hyun Han)  Personal Website Data
   BASE_URL만 수정하면 GitHub Pages 등에서도 동작합니다.
   ============================================================ */

/* ──────────── QEA (Quantum-inspired Evolutionary Algorithm) 섹션 ──────────── */
const qeaAbstract = `A quantum computer exploits the inherent parallelism that is provided by the superposition of quantum states. All states can be represented using probabilistic methods in parallel processing, and the act of observing the quantum computer produces a single state. A novel evolutionary computing algorithm called the Quantum-inspired Evolutionary Algorithm (QEA) was proposed and pursued. QEA is characterized by principles of quantum computing including concepts of qubits and superposition of states. QEA uses a Q-bit representation instead of binary, numeric or symbolic representations. QEA can imitate parallel computation in classical computers.`;

const qeaThesis = {
  citation: '<b>Kuk-Hyun Han</b>, <i>Quantum-inspired Evolutionary Algorithm</i>. Ph.D thesis, Electrical Engineering and Computer Science, Korea Advanced Institute of Science and Technology (KAIST), June 2003.',
  files: [{ url: "assets/docs/PhDthesis_QEA.pdf", icon: "📄", tip: "박사논문 PDF" }]
};

const qeaJournals = [
  {
    citation: 'Jun-Su Jang, <b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "Evolutionary algorithm-based face verification," <i>Pattern Recognition Letters</i>, Elsevier B. V., Vol. 25, No. 16, pp. 1857-1865, December 2004.',
    files: [{ url: "assets/docs/PRL2004_Face.pdf", icon: "📄", tip: "PDF" }]
  },
  {
    citation: '<b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "Quantum-inspired Evolutionary Algorithms with a New Termination Criterion, Hε Gate, and Two Phase Scheme," <i>IEEE Transactions on Evolutionary Computation</i>, IEEE Press, Vol. 8, No. 2, pp. 156-169, April 2004.',
    files: [
      { url: "assets/docs/TEVC2004_V8N2.pdf", icon: "📄", tip: "PDF" },
      { url: "assets/docs/knapsack_data.zip", icon: "📦", tip: "Knapsack Data" }
    ]
  },
  {
    citation: 'Kyung-Ho Kim, Joo-Young Hwang, <b>Kuk-Hyun Han</b>, Jong-Hwan Kim and Kyu-Ho Park, "A Quantum-inspired Evolutionary Computing Algorithm for Disk Allocation Method," <i>IEICE Transactions on Information and Systems</i>, IEICE Press, Vol. E86-D, No. 3, pp. 645-649, March 2003.',
    files: [{ url: "assets/docs/IEICE_QDM2003.pdf", icon: "📄", tip: "PDF" }]
  },
  {
    citation: '<b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "Quantum-inspired Evolutionary Algorithm for a Class of Combinatorial Optimization," <i>IEEE Transactions on Evolutionary Computation</i>, IEEE Press, Vol. 6, No. 6, pp. 580-593, December 2002.',
    files: [
      { url: "assets/docs/TEVC2002_V6N6.pdf", icon: "📄", tip: "PDF" },
      { url: "assets/docs/knapsack_data.zip", icon: "📦", tip: "Knapsack Data" }
    ]
  }
];

const qeaConferences = [
  {
    citation: '<b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "On the Analysis of the Quantum-inspired Evolutionary Algorithm with a Single Individual," in <i>Proceedings of the 2006 IEEE Congress on Evolutionary Computation</i>, IEEE Press, pp. 9172-9179, July 2006.',
    files: [{ url: "assets/docs/CEC2006_QEAanalysis.pdf", icon: "📄", tip: "PDF" }]
  },
  {
    citation: 'Yehoon Kim, Jong-Hwan Kim and <b>Kuk-Hyun Han</b>, "Quantum-inspired Multiobjective Evolutionary Algorithm for Multiobjective 0/1 Knapsack Problems," in <i>Proceedings of the 2006 IEEE Congress on Evolutionary Computation</i>, IEEE Press, pp. 9151-9156, July 2006.',
    files: [{ url: "assets/docs/CEC2006_QMEA.pdf", icon: "📄", tip: "PDF" }]
  },
  {
    citation: 'Jun-Su Jang, <b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "Face Detection using Quantum-inspired Evolutionary Algorithm," in <i>Proceedings of the 2004 IEEE Congress on Evolutionary Computation</i>, IEEE Press, pp. 2100-2106, June 2004.',
    files: [{ url: "assets/docs/CEC2004_Face.pdf", icon: "📄", tip: "PDF" }]
  },
  {
    citation: '<b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "On Setting the Parameters of Quantum-inspired Evolutionary Algorithm for Practical Applications," in <i>Proceedings of the 2003 IEEE Congress on Evolutionary Computation</i>, IEEE Press, pp. 178-184, December 2003.',
    files: [{ url: "assets/docs/CEC2003-QEA.pdf", icon: "📄", tip: "PDF" }]
  },
  {
    citation: 'Jun-Su Jang, <b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "Quantum-inspired Evolutionary Algorithm-based Face Verification," <i>Lecture Notes in Computer Science (GECCO 2003)</i>, eds. E. Cantu-Paz et al., Berlin Heidelberg: Springer-Verlag, Vol. 2724, pp. 2147-2156, July 2003.',
    files: [
      { url: "assets/docs/GECCO2003_FACE.pdf", icon: "📄", tip: "PDF" },
      { url: "assets/images/gecco2003_UIUC.jpg", icon: "🖼️", tip: "GECCO UIUC" }
    ]
  },
  {
    citation: '<b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "On Setting the Parameters of QEA for Practical Applications: Some Guidelines based on Empirical Evidence," <i>Lecture Notes in Computer Science (GECCO 2003)</i>, eds. E. Cantu-Paz et al., Berlin Heidelberg: Springer-Verlag, Vol. 2723, pp. 427-428, July 2003.',
    files: [
      { url: "assets/docs/GECCO2003_QEA.pdf", icon: "📄", tip: "PDF" },
      { url: "assets/images/gecco2003chicago.jpg", icon: "🖼️", tip: "Chicago" }
    ]
  },
  {
    citation: '<b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "Introduction of Quantum-inspired Evolutionary Algorithm," in <i>Proceedings of the 2002 FIRA Robot World Congress</i>, pp. 243-248, May 2002.',
    files: [{ url: "assets/docs/QEAFIRA.pdf", icon: "📄", tip: "PDF" }]
  },
  {
    citation: '<b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "Analysis of Quantum-inspired Evolutionary Algorithm," in <i>Proceedings of the 2001 International Conference on Artificial Intelligence</i>, CSREA Press, Vol. 2, pp. 727-730, June 2001.',
    files: [
      { url: "assets/docs/IC-AI2001.pdf", icon: "📄", tip: "PDF" },
      { url: "assets/images/icai1.jpg", icon: "🖼️", tip: "사진 1" },
      { url: "assets/images/icai2.jpg", icon: "🖼️", tip: "사진 2" }
    ]
  },
  {
    citation: '<b>Kuk-Hyun Han</b>, Kui-Hong Park, Chi-Ho Lee and Jong-Hwan Kim, "Parallel Quantum-inspired Genetic Algorithm for Combinatorial Optimization Problem," in <i>Proceedings of the 2001 IEEE Congress on Evolutionary Computation</i>, IEEE Press, pp. 1422-1429, May 2001.',
    files: [
      { url: "assets/docs/CEC2001.pdf", icon: "📄", tip: "PDF" },
      { url: "assets/images/cec2001.jpg", icon: "🖼️", tip: "사진" }
    ]
  },
  {
    citation: '<b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "Genetic Quantum Algorithm and its Application to Combinatorial Optimization Problem," in <i>Proceedings of the 2000 IEEE Congress on Evolutionary Computation</i>, IEEE Press, pp. 1354-1360, July 2000.',
    files: [
      { url: "assets/docs/cec2000.pdf", icon: "📄", tip: "PDF" },
      { url: "assets/docs/knapsack_data.zip", icon: "📦", tip: "Knapsack Data" },
      { url: "assets/images/cec2000.jpg", icon: "🖼️", tip: "사진" }
    ]
  }
];

const qeaDomestic = [
  {
    citation: 'Yehoon Kim, Jong-Hwan Kim and <b>Kuk-Hyun Han</b>, "Quantum-inspired Multiobjective Evolutionary Algorithm," in <i>Proceedings of the KACC</i>, ICASE, October 2005. (Korean)',
    files: [{ url: "assets/docs/QMOEAKACC05.pdf", icon: "📄", tip: "PDF" }]
  }
];

const qeaPatent = {
  citation: 'Jong-Hwan Kim and <b>Kuk-Hyun Han</b>, "Genetic Quantum Algorithm using quantum computing concept," Patent Number 0350233, Korea (2000.3.27 / 2002.8.13)',
  files: []
};

/* ──────────── 학력사항 ──────────── */
const education = [
  {
    period: "1999.03.~2003.08.",
    title: "박사, 전자전산학과 전기및전자공학전공",
    org: "한국과학기술원 (KAIST)", orgUrl: "http://www.kaist.ac.kr/",
    desc: '(박사논문: "양자개념을 도입한 진화 알고리즘"&ensp;—&ensp;Quantum-inspired Evolutionary Algorithm)',
    files: [
      { url: "assets/docs/PhDthesis_QEA.pdf", icon: "📄", tip: "박사논문 PDF" }
    ]
  },
  {
    period: "1997.03.~1999.02.",
    title: "석사, 전자전산학과 전기및전자공학전공",
    org: "한국과학기술원 (KAIST)", orgUrl: "http://www.kaist.ac.kr/",
    desc: '(석사논문: "인터넷 기반 퍼스널 로봇 시스템의 제어 구조 설계")',
    files: [
      { url: "assets/docs/MSthesis.pdf", icon: "📄", tip: "석사논문 PDF" }
    ]
  },
  {
    period: "1993.03.~1997.02.",
    title: "학사, 전자전산학과 전기및전자공학전공",
    org: "한국과학기술원 (KAIST)", orgUrl: "http://www.kaist.ac.kr/",
    desc: '(졸업논문: "마이크로로봇의 설계와 지능적인 제어기의 구현")',
    files: [
      { url: "assets/docs/BSthesis.pdf", icon: "📄", tip: "졸업논문 PDF" }
    ]
  },
  {
    period: "1991.03.~1993.02.",
    title: "대전과학고등학교",
    org: "과학영재학교 대전과학고등학교", orgUrl: "http://djshs.djsch.kr/main.do",
    desc: "",
    files: []
  },
{
    period: "2015.04.~2015.07.",
    title: "KAIST 차세대 혁신리더 양성과정",
    org: "KAIST", orgUrl: "http://www.kaist.ac.kr/",
    desc: "",
    files: [
      { url: "assets/docs/KAIST_leader_certificate.pdf", icon: "📄", tip: "수료증" },
      { url: "assets/docs/KAIST_leader_award1.pdf", icon: "📄", tip: "표창장" },
      { url: "assets/docs/KAIST_leader_award2.pdf", icon: "📄", tip: "우수상" },
      { url: "assets/images/KAIST_leader_ceremony1.jpg", icon: "🖼️", tip: "수료식 1" },
      { url: "assets/images/KAIST_leader_ceremony2.jpg", icon: "🖼️", tip: "수료식 2" }
    ]
  },
  {
    period: "2013.01.~2013.05.",
    title: "2013 Engineering Leadership Professional Program",
    org: "College of Engineering, University of California, Berkeley",
    orgUrl: "https://www.berkeley.edu/",
    desc: "",
    files: [
      { url: "assets/images/UC-Berkeley_ELPP.jpg", icon: "🖼️", tip: "Certificate" }
    ]
  }
];

/* ──────────── 경력사항 ──────────── */
const career = [
  {
    period: "2023.09.~현재",
    title: '겸임교수, <a href="https://home.sch.ac.kr/factory/index.jsp">스마트팩토리공학과</a>, <a href="https://home.sch.ac.kr/sch/">순천향대학교</a>',
    files: []
  },
  {
    period: "2018.07.~현재",
    title: '사장 / 연구소장, <a href="http://www.sym.co.kr/">삼영기계(주)</a>',
    desc: '<a href="https://news.naver.com/main/read.nhn?mode=LSD&mid=sec&oid=469&aid=0000452091&sid1=001">소재 부품 장비 강소기업100 선정</a>',
    files: [
      { url: "assets/docs/HiddenChampion100.pdf", icon: "📄", tip: "강소기업100 PDF" },
      { url: "https://www.hankyung.com/article/2023101619191", icon: "📰", tip: "한경 기사" },
      { url: "https://www.hellot.net/news/article.html?no=66688", icon: "📰", tip: "헬로티 기사" },
      { url: "https://amenews.kr/news/view.php?idx=48504", icon: "📰", tip: "AM뉴스 기사" },
      { url: "https://www.sandgraphy.com/", icon: "🌐", tip: "Sandgraphy" },
      { url: "http://www.youtube.com/watch?v=LiQt_dgDXw8", icon: "🎬", tip: "YouTube" },
      { url: "https://www.youtube.com/watch?v=eKLZ2haWy_M", icon: "🎬", tip: "YouTube" },
      { url: "https://www.youtube.com/watch?v=v7GARnDWtIM", icon: "🎬", tip: "YouTube" }
    ]
  },
  {
    period: "2016.11.~현재",
    title: '대표, <a href="http://lumoscandle.com/">루모스캔들(주)</a>',
    files: [
      { url: "http://www.cnet.co.kr/view/100165247", icon: "📰", tip: "CNET 기사" },
      { url: "http://hellodd.com/?md=news&mt=view&pid=61278", icon: "📰", tip: "HelloDD 기사" },
      { url: "https://www.wadiz.kr/web/wcampaign/search?keyword=%EB%A3%A8%EB%AA%A8%EC%8A%A4", icon: "🌐", tip: "Wadiz" },
      { url: "https://youtu.be/Q6eReTQys2o", icon: "🎬", tip: "YouTube" },
      { url: "https://www.youtube.com/watch?v=dtwzdyadi3o", icon: "🎬", tip: "YouTube" }
    ]
  },
  {
    period: "2013.08.~2018.06.",
    title: '전무이사 / 연구소장, <a href="http://www.sym.co.kr/">삼영기계(주)</a>',
    files: [
      { url: "http://news.donga.com/List/3/01/20130911/57592832/1", icon: "📰", tip: "동아일보 기사" }
    ]
  },
  {
    period: "2010.11.~2013.07.",
    title: 'Director, User Experience Center America (Mobile, VD, Display, Innovations) & <a href="https://thinktankteam.info/">Think Tank Team</a>, 삼성전자(주), 산호세, 미국',
    files: [
      { url: "https://www.youtube.com/user/tttsamsung", icon: "🎬", tip: "TTT YouTube" },
      { url: "https://www.youtube.com/watch?v=2v0YtNOckEY", icon: "🎬", tip: "YouTube" }
    ]
  },
  {
    period: "2010.03.~2013.08.",
    title: '수석연구원, DMC연구소, <a href="http://www.sec.co.kr/">삼성전자(주)</a>',
    files: []
  },
  {
    period: "2006.02.~2007.01.",
    title: 'Visiting Scientist, <a href="http://www.media.mit.edu/">미디어랩</a>, <a href="http://www.mit.edu/">Massachusetts Institute of Technology (MIT)</a>',
    files: []
  },
  {
    period: "2003.09.~2010.02.",
    title: '책임연구원, DMC연구소, <a href="http://www.sec.co.kr/">삼성전자(주)</a>',
    files: []
  }
];

/* ──────────── 연구관심분야 ──────────── */
const researchInterests = [
  "Digital Transformation",
  "Additive Manufacturing (Industrial / Sand / Metal 3D Printing)",
  "Industry 4.0 / Smart Factory",
  "Medium-speed Engine Innovation",
  "Numerical & Combinatorial Optimization",
  "Quantum-inspired Evolutionary Algorithm (QEA)",
  "Artificial Intelligence",
  "UX Design",
  "Creativity & Innovation",
  "Business Modeling & Simulation",
  "Human-Computer Interaction (Tangible Interfaces)",
  "Creative Learning",
  "Human-Robot Interaction",
  "Internet-based Personal Robot Systems",
  "Quantum Computing"
];

/* ──────────── 연구과제 (프로젝트 경험) ──────────── */
const projects = [
  { period: "2022.~현재", title: "1200 리터급 Binder Jetting 방식 3D 프린터 개발", org: '<a href="https://www.smtech.go.kr/front/main/main.do">중소벤처기업부</a>', role: "총괄책임자", files: [] },
  { period: "2022.~현재", title: "VT903 엔진 블록 샌드 3D 프린팅 하이브리드 금형 적용", org: '<a href="https://www.smtech.go.kr/front/main/main.do">중소벤처기업부</a>', role: "총괄책임자", files: [] },
  { period: "2021.09.~2023.09.", title: "340mm급 엔진 피스톤 일체형 중자 DfAM 설계 및 제조 공정 혁신", org: '<a href="https://www.smtech.go.kr/front/main/main.do">중소벤처기업부</a>', role: "총괄책임자", files: [] },
  { period: "2021.05.~2022.06.", title: "VT903 엔진 실린더 헤드 시제품 개발", org: "충남국방벤처센터", role: "총괄책임자", files: [] },
  { period: "2020.11.~현재", title: "친환경 피스톤 링 개발", org: '<a href="https://www.smtech.go.kr/front/main/main.do">중소벤처기업부</a>', role: "총괄책임자", files: [] },
  { period: "2019.05.~2019.12.", title: "광교 갤러리아 백화점 Smart Notes", org: "위드웍스 & 3D프리욜 공동 프로젝트", role: "총괄책임자", files: [{ url: "https://www.hankyung.com/article/202310160230i", icon: "📰", tip: "한경 기사" }] },
  { period: "2017.04.~2021.06.", title: "산업용 샌드 3D 프린터 및 하이브리드 주조 공정 개발", org: '<a href="https://www.keit.re.kr/eng/index.do">KEIT</a> / <a href="http://www.motie.go.kr/www/main.do">산업통상자원부</a>', role: "총괄책임자", files: [{ url: "https://news.mt.co.kr/mtview.php?no=2020111817480295756", icon: "📰", tip: "머니투데이" }, { url: "http://amenews.kr/news/view.php?idx=43742", icon: "📰", tip: "AM뉴스" }, { url: "http://amenews.kr/news/view.php?idx=43860", icon: "📰", tip: "AM뉴스" }] },
  { period: "2017.11.~2019.03.", title: "스마트 자동점화 캔들 기술 개발", org: '<a href="https://www.smtech.go.kr/front/main/main.do">중소벤처기업부</a>', role: "총괄책임자", files: [] },
  { period: "2017.10.~2020.01.", title: "화장품 양산용 3D 프린터 개발", org: '<a href="https://www.mk.co.kr/news/business/view/2019/03/133007/">콜마코리아</a>', role: "총괄책임자", files: [{ url: "https://www.mk.co.kr/news/business/view/2019/03/133007/", icon: "📰", tip: "매경 기사" }] },
  { period: "2015.10.~2018.01.", title: "점성식 비틀림 진동 댐퍼(Viscous Torsional Vibration Damper) 개발", org: '<a href="https://www.smtech.go.kr/front/main/main.do">중소벤처기업부</a>', role: "총괄책임자", files: [] },
  { period: "2013.01.~2013.05.", title: "PRESTIGE 럭셔리 UX", org: '<a href="http://www.samsung.com/">삼성전자(주)</a>', role: "Project Lead", files: [] },
  { period: "2010.01.~2010.11.", title: "Orsay 혁신 UX (스마트폰)", org: '<a href="http://www.samsung.com/">삼성전자(주)</a>', role: "Project Lead", files: [
      { url: "http://youtu.be/eAF4s3Xowqk", icon: "🎬", tip: "EmoLink" },
      { url: "assets/media/channeling.mp4", icon: "🎬", tip: "Channeling" },
      { url: "http://www.youtube.com/watch?v=jxFjMpe-iSg", icon: "🎬", tip: "Panning" },
      { url: "https://www.youtube.com/shorts/fcVD9XbwE_Y", icon: "🎬", tip: "Shape Touch" },
      { url: "http://www.youtube.com/watch?v=kE6rsJvORko", icon: "🎬", tip: "Palm Pause" }
    ] },
  { period: "2008.12.~2009.12.", title: "iQ 인터랙션 솔루션", org: '<a href="http://www.samsung.com/">삼성전자(주)</a>', role: "Project Lead", files: [{ url: "https://www.youtube.com/watch?v=ZQqLKyy94Dw", icon: "🎬", tip: "YouTube" }, { url: "https://www.youtube.com/watch?v=H1SoYTCzB6A", icon: "🎬", tip: "YouTube" }] },
  { period: "2006.02.~2007.01.", title: 'The Huggable: Therapeutic Robotic Companion — <a href="http://www.media.mit.edu/">MIT Media Lab</a>', org: '<a href="http://www.mit.edu/">MIT</a>', role: "Visiting Scientist", files: [] },
  { period: "2006.02.~2007.01.", title: 'Consumer Electronics 2.0 (CE 2.0) — <a href="http://www.media.mit.edu/">MIT Media Lab</a>', org: '<a href="http://www.mit.edu/">MIT</a>, Samsung, Motorola, Toshiba', role: "Initiative Member", files: [] }
,
  { period: "2000.09.~2003.08.", title: "Development of Stereo Vision Head for Human-Robot Interaction", org: '<a href="http://www.kist.re.kr">KIST</a>', role: "Researcher", files: [{ url: "assets/images/sample640.jpg", icon: "🖼️", tip: "Sample 640" }, { url: "assets/images/sample320.jpg", icon: "🖼️", tip: "Sample 320" }, { url: "assets/images/KAIST_stereo.jpg", icon: "🖼️", tip: "KAIST Stereo" }] },
  { period: "2000.04.~2000.12.", title: "Development of USB HUB plus LAN Device", org: "Withus & Innocom", role: "Developer", files: [{ url: "assets/images/hublan1.jpg", icon: "🖼️", tip: "HUB LAN" }, { url: "assets/images/ino.jpg", icon: "🖼️", tip: "INO" }] },
  { period: "1998.09.~2000.08.", title: "Development of Internet-based Personal Robot", org: "IITA", role: "Researcher", files: [{ url: "assets/images/gui.jpg", icon: "🖼️", tip: "GUI" }, { url: "assets/images/mybot.bmp", icon: "🖼️", tip: "MyBot" }] },
  { period: "1998.01.~2000.12.", title: "Development of the Optimizer for SMT", org: '<a href="http://www.mirae.co.kr/">Mirae Corporation</a>', role: "Researcher", files: [{ url: "assets/images/smt.jpg", icon: "🖼️", tip: "SMT" }] }
];

/* ──────────── 수상경력 ──────────── */
const awards = [
  { date: "2023. 11.", title: "제8회 3D프린팅 BIZCON 경진대회 최우수상 – 특허청장상", files: [{ url: "assets/images/3DPrintingBizcon_2023.jpg", icon: "🖼️", tip: "수상 사진" }] },
  { date: "2023. 10.", title: '뿌리산업 발전 유공자 – 산업통상자원부장관 표창, <a href="https://www.motie.go.kr/">산업통상자원부</a>', files: [{ url: "assets/docs/PPURI_2023.pdf", icon: "📄", tip: "표창장 PDF" }] },
  { date: "2022. 11.", title: '2022 3D프린팅 활용 우수사례 경진대회 최우수상 – 과학기술정보통신부 장관상(삼영기계), <a href="https://www.msit.go.kr/index.do">과학기술정보통신부</a>', files: [{ url: "assets/docs/3DP_MSIT_2022.pdf", icon: "📄", tip: "상장 PDF" }, { url: "http://amenews.kr/news/view.php?idx=51408", icon: "📰", tip: "AM뉴스" }] },
  { date: "2022. 10.", title: '2022 한국의 산업을 이끈 산업기술성과 19선 선정(삼영기계), <a href="https://www.naek.or.kr/home_kr/index.asp">한국공학한림원</a>', files: [{ url: "https://news.mt.co.kr/mtview.php?no=2022101313052631515", icon: "📰", tip: "머니투데이" }, { url: "https://biz.chosun.com/science-chosun/science/2022/10/12/XWDMWR3KQJA35IFMH3OPIQIOSU/?utm_source=naver&utm_medium=original&utm_campaign=biz", icon: "📰", tip: "조선비즈" }] },
  { date: "2022. 9.", title: '2022 전국뿌리기술경기대회(주조분야) – 중소벤처기업부 장관상(삼영기계), <a href="https://www.msit.go.kr/index.do">과학기술정보통신부</a>', files: [{ url: "assets/images/CastingTech_2022.jpg", icon: "🖼️", tip: "수상 사진" }, { url: "http://amenews.kr/news/view.php?idx=50497", icon: "📰", tip: "AM뉴스" }] },
  { date: "2021. 11.", title: '3D프린팅 산업발전 유공자 – 과학기술정보통신부장관 표창, <a href="https://www.msit.go.kr/index.do">과학기술정보통신부</a>', files: [{ url: "assets/docs/3DP_MSIT_2021.pdf", icon: "📄", tip: "표창장 PDF" }, { url: "https://news.mt.co.kr/mtview.php?no=2021112410114019744", icon: "📰", tip: "머니투데이" }] },
  { date: "2021. 11.", title: '2021 3D프린팅 활용 우수사례 경진대회 – 우수상(삼영기계), <a href="https://www.nipa.kr/index.jsp">정보통신산업진흥원</a>', files: [{ url: "assets/docs/3DP_NIPA_2021.pdf", icon: "📄", tip: "상장 PDF" }] },
  { date: "2021. 10.", title: '뿌리산업 혁신과 3D프린팅 확산 공로 – 국회 과학기술정보방송통신위원회 위원장 표창, <a href="https://science.na.go.kr:444/science/index.do">과학기술정보방송통신위원회</a>', files: [{ url: "assets/docs/3DP_NationalAssembly_2021.pdf", icon: "📄", tip: "표창장 PDF" }, { url: "assets/images/3DP_NationalAssembly_2021.jpg", icon: "🖼️", tip: "수상 사진" }] },
  { date: "2021. 9.", title: '2021 전국뿌리기술경기대회(주조분야) – 중소벤처기업부 장관상(삼영기계), <a href="https://www.mss.go.kr/site/smba/main.do">중소벤처기업부</a>', files: [{ url: "assets/images/CastingTech_2021.jpg", icon: "🖼️", tip: "수상 사진" }, { url: "https://news.mt.co.kr/mtview.php?no=2021110112384013589", icon: "📰", tip: "머니투데이" }] },
  { date: "2020. 12.", title: '3D프린팅 경진대회(Innovation Challenge) 최우수상 – 과학기술정보통신부 장관상(삼영기계), <a href="https://www.msit.go.kr/index.do">과학기술정보통신부</a>', files: [{ url: "assets/docs/3DP_NIPA_2020.pdf", icon: "📄", tip: "상장 PDF" }, { url: "http://amenews.kr/news/view.php?idx=43860", icon: "📰", tip: "AM뉴스" }] },
  { date: "2020. 11.", title: '한국정밀공학회 2020 통합학술대회 – 최우수논문상, <a href="http://www.kspe.or.kr/">한국정밀공학회</a>', files: [{ url: "assets/docs/BestPaperAward_KSPE2020.pdf", icon: "📄", tip: "상장 PDF" }] },
  { date: "2020. 9.", title: '제4회 DfAM 경진대회 – 동상, <a href="http://www.kamug.or.kr/index.php?theme=KAMUG">한국3D프린팅사용자협회</a>', files: [{ url: "assets/docs/DfAM_prize_2020.pdf", icon: "📄", tip: "상장 PDF" }] },
  { date: "2019. 12.", title: '대한민국 기술사업화대전 – 기술사업화부문 산업통상자원부장관 표창, <a href="http://www.motie.go.kr/www/main.do">산업통상자원부</a>', files: [{ url: "assets/docs/Minister_Award_201912.pdf", icon: "📄", tip: "표창장 PDF" }, { url: "assets/images/20191212_award.jpg", icon: "🖼️", tip: "수상 사진" }, { url: "http://www.joongdo.co.kr/main/view.php?key=20191213010005855", icon: "📰", tip: "중도일보" }] },
  { date: "2019. 9.", title: "전국주조기술경기대회 단체전(삼영기계) 1위 – 국무총리상 수상", files: [{ url: "assets/docs/CastingTech_2019.pdf", icon: "📄", tip: "상장 PDF" }] },
  { date: "2017. 12.", title: '대한민국 3D프린팅 산업발전 대상 유공자 – 정보통신산업진흥원장 표창, <a href="http://www.nipa.kr/main.html">정보통신산업진흥원</a>', files: [{ url: "assets/docs/3DP_NIPA_2017.pdf", icon: "📄", tip: "표창장 PDF" }] },
  { date: "2017. 09.", title: "도전 K-스타트업 본선진출 – 100팀", files: [] },
  { date: "2017. 07.", title: "대한민국 창업대전 지역예선 – 최우수상", files: [{ url: "assets/docs/LUMOS_award_2017.pdf", icon: "📄", tip: "상장 PDF" }] },
  { date: "2015. 06.", title: "품질경영 유공자 도지사상", files: [{ url: "assets/docs/QM_award_201506.pdf", icon: "📄", tip: "상장 PDF" }] },
  { date: "2010. 11.", title: '삼성논문상 2010 – 은상, 삼성 – "Touch-and-Link: Inter-Device Interaction Associating Touched Points" (김학준, 한상준, 은동진, 이택헌, 홍승환, 한국현, 강성훈)', files: [] },
  { date: "2007. 11.", title: "SW Day 우수 과제 출품 전시회 – 금상, 삼성전자 DM총괄", files: [] },
  { date: "2005. 1.", title: 'SW논문발표회 – 최우수논문상, 삼성전자 디지털미디어 연구소 – "Quantum-inspired Evolutionary Algorithms for a Class of Combinatorial and Numerical Optimization Problems"', files: [] },
  { date: "2003. 2.", title: '제 9회 삼성 휴먼테크논문대상 – 금상 – "2상 양자 진화 알고리즘"', files: [{ url: "assets/docs/TPQEA_Humantech2002.pdf", icon: "📄", tip: "논문 PDF" }, { url: "assets/images/humantech_9th_1.jpg", icon: "🖼️", tip: "사진 1" }, { url: "assets/images/humantech_9th_2.jpg", icon: "🖼️", tip: "사진 2" }] },
  { date: "2001. 8.", title: '<a href="http://www.fira.net/">FIRA</a> Cup China 2001 – Middle League MiroSot 부문 2위', files: [{ url: "assets/images/soty5.jpg", icon: "🖼️", tip: "SOTY5 사진" }, { url: "assets/images/simulator1.bmp", icon: "🖼️", tip: "시뮬레이터" }, { url: "assets/images/fira2001.jpg", icon: "🖼️", tip: "FIRA 2001" }] },
  { date: "2001. 5.", title: "FIRA-KAIST Cup 2001 – Small League MiroSot 부문 1위", files: [] },
  { date: "2001. 2.", title: '제 7회 삼성 휴먼테크논문대상 – 동상 – "양자 진화 알고리즘"', files: [{ url: "assets/docs/Humantech2000S.pdf", icon: "📄", tip: "논문 PDF" }, { url: "assets/images/humantech0.jpg", icon: "🖼️", tip: "사진 1" }, { url: "assets/images/humantech1.jpg", icon: "🖼️", tip: "사진 2" }] },
  { date: "2000. 11.", title: "Feel KAIST 2000 논문 발표 컨테스트 – 영어부문 특별상", files: [] },
  { date: "1997. 6.", title: "세계 마이크로로봇 축구 대회 '97 – S-MiroSot 부문 2위", files: [{ url: "assets/images/robot1.jpg", icon: "🖼️", tip: "로봇 사진" }, { url: "assets/images/mirage1.jpg", icon: "🖼️", tip: "MIRAGE 사진" }] },
  { date: "1996. 11.", title: "세계 마이크로로봇 축구 대회 '96 – 공로상", files: [{ url: "assets/images/mirage3.jpg", icon: "🖼️", tip: "MIRAGE 사진" }] },
  { date: "1994", title: '제 1회 IEEE 회로 경시대회 – 2학년 부문 1위 (<a href="http://www.ieee.org/">IEEE</a> <a href="http://www.kaist.ac.kr/">KAIST</a> Student branch 주최)', files: [] },
  { date: "1992. 10.", title: '제 38회 <a href="http://www.science.go.kr/">전국과학전람회</a> 대통령상 – "격자에의해 생기는 물결무늬의 해석과 그 응용에 관한 연구"', files: [{ url: "assets/docs/moire.pdf", icon: "📄", tip: "논문 PDF" }] },
  { date: "1992", title: "제 4회 대전시 수학과학경시대회 – 물리부문 금상", files: [] },
  { date: "1992", title: "제 4회 전국 수학과학경시대회 – 물리부문 장려상", files: [] },
  { date: "1990", title: "제 1회 대전시 컴퓨터프로그래밍경진대회 – 금상", files: [] }
];

/* ──────────── 기타활동 ──────────── */
const activities = {
  board: [
    { period: "2023. 01. – 현재", title: '부회장, <a href="http://www.kfs.or.kr/html/?pmode=introduce">한국주조공학회</a>' },
    { period: "2022. 01. – 현재", title: '전문이사, <a href="http://www.s4ira.or.kr/">스마트4차산업혁명협회</a>' },
    { period: "2019. 01. – 2022. 12.", title: '국제협력이사, <a href="http://www.kfs.or.kr/html/?pmode=introduce">한국주조공학회</a>' },
    { period: "2018. 09. – 2021. 09.", title: '이사, <a href="https://www.nst.re.kr/nst/about/06_01.jsp">국가과학기술연구회</a>, <a href="https://www.msit.go.kr/index.do">과학기술정보통신부</a>' }
  ],
  committee: [
    { period: "2020. 11. – 현재", title: '정책자문위원회 위원, <a href="https://www.kitech.re.kr/main/">한국생산기술연구원</a>' },
    { period: "2020. 07. – 현재", title: '경영자문위원회 위원, <a href="https://www.kimm.re.kr/">한국기계연구원</a>' },
    { period: "2019. 04. – 2020. 02", title: '대한민국 과학기술 미래전략 2045 – 혁신생태계 분과위원회 위원, <a href="http://english.msip.go.kr/web/main/main.do">과학기술정보통신부</a>' },
    { period: "2018. 03. – 현재", title: '의원, <a href="http://daejeoncci.korcham.net/front/contents/exepageList.do?exeGbn=2">대전상공회의소</a>' }
  ],
  standardization: [
    { period: "2006.09.~2007.01", title: 'Initiative Member, <i>Consumer Electronics (CE) 2.0</i>, <a href="http://www.media.mit.edu/">The MIT Media Lab</a>, Samsung, Motorola, Toshiba' }
  ],
  invitedTalks: [
    { date: "2020.12.01.", title: '"직경 225㎜급 피스톤 일체형 중자의 DfAM 설계를 통한 제조 공정 혁신", 제2회 3D프린팅 기술확산 컨퍼런스, <a href="http://www.3dpro.or.kr/html/main/main.html">3D프린팅연구조합</a>, <a href="https://www.nipa.kr/">정보통신산업진흥원</a>', files: [] },
    { date: "2020.11.19.", title: '"주조 산업의 뉴노멀과 3D 프린팅 기술", 기술강연, 한국주조공학회 2020 추계대회, <a href="http://www.kfs.or.kr/html/">한국주조공학회</a>', files: [] },
    { date: "2020.11.18.", title: '"3D프린팅 기술을 이용한 제조 공정 혁신", <a href="http://inside3dprinting.co.kr/2020/p1.php">인사이드 3D프린팅 컨퍼런스</a>', files: [] },
    { date: "2020.10.27.", title: '"3D프린팅 기반 제조 혁신: 양산공정 개선 및 적용분야 확대 사례", <a href="https://nipa3dprinting.imweb.me/88">중소기업 최고 CEO 3D프린팅 경영혁신 웨비나</a>, <a href="http://www.3dpro.or.kr/html/main/main.html">3D프린팅연구조합</a>', files: [] },
    { date: "2020.07.23.", title: '"삼영기계 소개 및 3D 프린팅을 통한 제조 혁신", <a href="https://vmspace.com/report/report_view.html?base_seq=MTE1NA%3D%3D">세운 글로벌 포럼 – 신제조업 시리즈</a>, <a href="https://www.facebook.com/SewoonCampus/">서울시립대학교 베타시티센터</a>', files: [] },
    { date: "2020.07.20.", title: '"3D 프린팅을 통한 산업별 혁신: 시제품에서 양산품으로, 제조 산업에서 다양한 산업으로의 확대", 총괄워크샵 키노트 강연, <a href="https://www.k3ders.org/index.php">첨단 신소재 기반 3D프린팅 전문인력양성 사업단</a>, <a href="http://www.motie.go.kr/www/main.do">산업통상자원부</a>', files: [] },
    { date: "2019.11.07.", title: '"샌드 3D 프린팅 적용을 통한 주조 제품 디자인 자유도 혁신", 기술강연, 한국주조공학회 2019 추계대회, <a href="http://www.kfs.or.kr/html/">한국주조공학회</a>', files: [] },
    { date: "2019.10.08.", title: '"샌드 3D프린팅을 활용한 주조 부품 제작 혁신 기술 소개", 해군 군수사 함정적용 신기술 설명회, <a href="https://www.navy.mil.kr/mbshome/mbs/navy/index.do">대한민국 해군</a>', files: [] },
    { date: "2019.07.11.", title: '"샌드 3D프린팅 기술 접목을 통한 주조품 양산 공정 혁신 및 생산성 개선 사례 연구", 기술강연, 한국주조공학회 2019 하계대회, <a href="http://www.kfs.or.kr/html/">한국주조공학회</a>', files: [] },
    { date: "2019.04.11.", title: '"샌드 3D프린팅을 이용한 주조품 시제품 개발 혁신 및 알루미늄, 주철, 주강 주조품 적용 사례", 기술강연, 한국주조공학회 2019 춘계대회, <a href="http://www.kfs.or.kr/html/">한국주조공학회</a>', files: [] },
    { date: "2018.11.08.", title: '"설계 자유도 향상을 위한 금형이 필요 없는 주조용 샌드 3D프린팅 솔루션", 기술강연, 한국주조공학회 2018 추계대회, <a href="http://www.kfs.or.kr/html/">한국주조공학회</a>', files: [] },
    { date: "2018.07.04.", title: '"신사업 및 스타트업 추진기", 대전충남세종 글로벌 비즈니스클럽 워크샵, <a href="https://www.kotra.or.kr/kh/main/KHMIUI010M.html">KOTRA</a>', files: [] },
    { date: "2018.04.02.", title: '"융합프로젝트 이야기", <a href="http://celt.kaist.ac.kr/html/main.php">교수학습혁신센터</a>, <a href="http://www.kaist.ac.kr/html/kr/index.html">KAIST</a>', files: [{ url: "assets/images/convergence_talk_KAIST_2018.jpg", icon: "🖼️", tip: "사진" }] },
    { date: "2017.11.06.", title: '"Designing new things that you have never seen before," <a href="http://dhe.unist.ac.kr/">School of Design & Human Engineering Seminar</a>, <a href="http://www.unist.ac.kr/">UNIST</a>', files: [{ url: "assets/docs/UNIST_talk_201708.pdf", icon: "📄", tip: "발표자료 PDF" }] },
    { date: "2017.09.21.", title: '"창의 디자인 노하우", <a href="http://smpd.hongik.ac.kr/community/notice_view/96/page/40?">산업체 전문가 특강</a>, <a href="http://www.hongik.ac.kr/index.do">홍익대학교</a>', files: [] },
    { date: "2017.08.21.", title: '"융합에 대한 고찰: 융합 노하우", <a href="http://cde.unist.ac.kr/bbs/board.php?bo_table=news&wr_id=44&page=1">제4회 전국 대학생 창의 디자인-공학 경진대회</a>, <a href="http://unist.ac.kr/">UNIST</a>', files: [] },
    { date: "2017.06.12.", title: '"융합", <a href="https://orip.hongik.ac.kr/">디자이니어 양성 사업단</a>, <a href="http://www.hongik.ac.kr/index.do">홍익대학교</a>', files: [] },
    { date: "2016.08.27.", title: '"돌파구 노트", 기업가정신 캠프, <a href="http://djshs.djsch.kr/main.do">과학영재학교 대전과학고등학교</a>', files: [{ url: "http://hellodd.com/?md=news&mt=view&pid=59042", icon: "📰", tip: "HelloDD 기사" }] },
    { date: "2014.05.07.", title: '"도전과 창의", 전기및전자공학과 KEY Seminar, <a href="http://www.kaist.ac.kr/">KAIST</a>', files: [{ url: "https://ee.kaist.ac.kr/alumnus/11070/", icon: "🌐", tip: "KAIST EE" }] },
    { date: "2013.11.29.", title: '"창의적 도전", 대학원 세미나, <a href="http://www.cnu.ac.kr/">충남대학교</a>', files: [] },
    { date: "2007.04.12.", title: '"A New Type of Robotic Companion," 문화기술대학원, <a href="http://www.kaist.ac.kr/">KAIST</a>', files: [] },
    { date: "2006.09.19.", title: '"A New Type of Robotic Companion," <a href="http://irrc.kaist.ac.kr/">ITRC-IRRC</a>, <a href="http://www.kaist.ac.kr/">KAIST</a>', files: [] },
    { date: "2006.07.12.", title: '"DTV – The 2nd Generation?," <a href="http://wiki.media.mit.edu/bin/view/Simplicity">SIMPLICITY</a> Open Media Event, <a href="http://www.media.mit.edu/">Media Lab</a>, <a href="http://www.mit.edu/">MIT</a>', files: [] }
  ],
  teaching: [
    { date: "2020.11.26.", title: '"샌드 3D 프린팅 기술의 활용", 3D프린팅 단기교육(2일), <a href="https://www.k3ders.org/index.php">첨단 신소재 기반 3D프린팅 전문인력양성 사업단</a>, <a href="http://www.motie.go.kr/www/main.do">산업통상자원부</a>' },
    { date: "2020.09.22.", title: '"샌드 3D 프린팅을 통한 주조산업 혁신", 주조아카데미 온라인 교육, <a href="http://www.kfs.or.kr/html/">한국주조공학회</a>' },
    { date: "2019.09.26.", title: '"샌드 3D프린팅을 활용한 주조 혁신", 한국주조공학회 대경지부 기술교육, <a href="http://www.kfs.or.kr/html/">한국주조공학회</a>' },
    { date: "2005.06.14.", title: '"컴퓨터 구조 & 알고리즘 (2)", 디지털미디어 연구소, 삼성전자(주)' },
    { date: "2005.04.12.", title: '"Tornado2 and VxWorks Training Workshop", 소프트웨어 교육 센터, 삼성전자(주)' },
    { date: "2005.02.25.", title: '"컴퓨터 구조 & 알고리즘 (1)", 디지털미디어 연구소, 삼성전자(주)' },
    { date: "2004.10.18.", title: '"VxWorks 입문 교육", 소프트웨어 교육 센터, 삼성전자(주)' },
    { date: "2004.09.13.", title: '"Tornado2 and VxWorks Training Workshop", 첨단기술연수소, 삼성전자(주)' },
    { date: "2003.03.14.", title: '"양자 진화 알고리즘 (QEA)", <a href="http://www.mrdec.org/">마이크로로봇 설계 교육 센터 (MRDEC)</a>, <a href="http://www.kaist.ac.kr/">KAIST</a>' }
  ],
  judges: [
    { period: "2006.03.~2006.11.", title: 'Program Committee Member, <a href="http://cis2006.gdut.edu.cn/">The 2006 International Conference on Computational Intelligence and Security (CIS 06)</a>' },
    { period: "2005.12.~2006.02.", title: "제 12회 삼성 휴먼테크 논문대상, Signal Processing 분과 간사/심사위원" },
    { period: "2004.12.~2005.02.", title: "제 11회 삼성 휴먼테크 논문대상, 멀티미디어 분과 간사/심사위원" },
    { period: "2003.12.~2004.02.", title: "제 10회 삼성 휴먼테크 논문대상, 멀티미디어 분과 소간사/심사위원" }
  ],
  reviewers: [
    "IEEE Transactions on Evolutionary Computation, IEEE Press",
    "IEEE Transactions on Systems, Man and Cybernetics – Part B, IEEE Press",
    "Autonomous Agents and Multi-Agent Systems, Kluwer",
    "Neurocomputing, Elsevier",
    "Journal of Advanced Computational Intelligence and Intelligent Informatics, Fuji Technology Press",
    "International Journal on Artificial Intelligence Tools, World Scientific",
    "International Journal of Electronic Business, Inderscience"
  ]
};

/* ──────────── PUBLICATIONS (전체 — 이전과 동일) ──────────── */
const phdThesis = {
  citation: '<b>Kuk-Hyun Han</b>, <i>Quantum-inspired Evolutionary Algorithm</i>. Ph.D thesis, Electrical Engineering and Computer Science, Korea Advanced Institute of Science and Technology (KAIST), June 2003.',
  files: [{ url: "assets/docs/PhDthesis_QEA.pdf", icon: "📄", tip: "박사논문 PDF" }]
};

const intlJournals = [
  { citation: '<b>Kuk-Hyun Han</b>, Jin-Wook Baek, Tae Wan Lim and Ju Min Park, "Digital Transformation of Metal Casting Process using Sand 3D Printing Technology with a Novel Methodology of Casting Design Inside a Core," <i>International Journal of Metalcasting</i>, 17, pp. 2674-2679, June 2023. <a href="https://doi.org/10.1007/s40962-023-01088-5">DOI</a>', files: [{ url: "https://rdcu.be/dff0J", icon: "📄", tip: "PDF" }] },
  { citation: 'Jun-Su Jang, <b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "Evolutionary algorithm-based face verification," <i>Pattern Recognition Letters</i>, Elsevier B. V., Vol. 25, No. 16, pp. 1857-1865, December 2004.', files: [{ url: "assets/docs/PRL2004_Face.pdf", icon: "📄", tip: "PDF" }] },
  { citation: '<b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "Quantum-inspired Evolutionary Algorithms with a New Termination Criterion, Hε Gate, and Two Phase Scheme," <i>IEEE Transactions on Evolutionary Computation</i>, IEEE Press, Vol. 8, No. 2, pp. 156-169, April 2004.', files: [{ url: "assets/docs/TEVC2004_V8N2.pdf", icon: "📄", tip: "PDF" }, { url: "assets/docs/knapsack_data.zip", icon: "📦", tip: "Knapsack Data" }] },
  { citation: 'Kyung-Ho Kim, Joo-Young Hwang, <b>Kuk-Hyun Han</b>, Jong-Hwan Kim and Kyu-Ho Park, "A Quantum-inspired Evolutionary Computing Algorithm for Disk Allocation Method," <i>IEICE Transactions on Information and Systems</i>, IEICE Press, Vol. E86-D, No. 3, pp. 645-649, March 2003.', files: [{ url: "assets/docs/IEICE_QDM2003.pdf", icon: "📄", tip: "PDF" }] },
  { citation: '<b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "Quantum-inspired Evolutionary Algorithm for a Class of Combinatorial Optimization," <i>IEEE Transactions on Evolutionary Computation</i>, IEEE Press, Vol. 6, No. 6, pp. 580-593, December 2002.', files: [{ url: "assets/docs/TEVC2002_V6N6.pdf", icon: "📄", tip: "PDF" }, { url: "assets/docs/knapsack_data.zip", icon: "📦", tip: "Knapsack Data" }] },
  { citation: '<b>Kuk-Hyun Han</b>, Sinn Kim, Yong-Jae Kim and Jong-Hwan Kim, "Internet Control Architecture for Internet-Based Personal Robot," <i>Autonomous Robots Journal</i>, Kluwer Academic Publishers, Vol. 10, No. 2, pp. 135-147, March 2001.', files: [{ url: "assets/docs/ARJ2001.pdf", icon: "📄", tip: "PDF" }] }
];

const intlConferences = [
  { citation: '<b>Kuk-Hyun Han</b>, Jin-Wook Baek, Tae Wan Lim and Ju Min Park, "Digital Transformation of Metal Casting Process using Sand 3D Printing Technology with a Novel Methodology of Casting Design Inside a Core," <i>The 74th World Foundry Congress 2022</i>, World Foundry Organization, October 2022.', files: [] },
  { citation: 'Sang-Jun Han, <b>Kuk-Hyun Han</b>, Pil Seung Yang and Bo Hyun Kyung, "Tracking the Position of a Mobile Device on Interactive Screens with RFID," in <i>Proceedings of the Sketches, SIGGRAPH Asia 2008</i>, ACM SIGGRAPH, December 2008.', files: [{ url: "assets/docs/SIGGRAPH_AISA2008_Simplicity.pdf", icon: "📄", tip: "PDF" }] },
  { citation: 'Walter D. Stiehl, Cynthia Breazeal, <b>Kuk-Hyun Han</b>, Jeff Lieberman, Levi Lalla, Allan Maymin, Jonathan Salinas, Daniel Fuentes, Robert Toscano, Cheng Hao Tong, Aseem Kishore, Matt Berlin and Jesse Gray, "The Huggable: A Therapeutic Robotic Companion for Relational, Affective Touch," demonstrated in <i>the Emerging Technologies, SIGGRAPH 2006</i>, ACM SIGGRAPH, August 2006.', files: [{ url: "assets/docs/SIGGRAPH2006_Huggable.pdf", icon: "📄", tip: "PDF" }, { url: "assets/media/SIGGRAPH2006.wmv", icon: "🎬", tip: "Video" }, { url: "assets/images/SIGGRAPH06_TeamPhoto.jpg", icon: "🖼️", tip: "Team Photo" }, { url: "assets/images/SIGGRAPH06_Huggable1.jpg", icon: "🖼️", tip: "Huggable 1" }, { url: "assets/images/SIGGRAPH06_Huggable2.jpg", icon: "🖼️", tip: "Huggable 2" }] },
  { citation: '<b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "On the Analysis of the Quantum-inspired Evolutionary Algorithm with a Single Individual," in <i>Proceedings of the 2006 IEEE Congress on Evolutionary Computation</i>, IEEE Press, pp. 9172-9179, July 2006.', files: [{ url: "assets/docs/CEC2006_QEAanalysis.pdf", icon: "📄", tip: "PDF" }] },
  { citation: 'Yehoon Kim, Jong-Hwan Kim and <b>Kuk-Hyun Han</b>, "Quantum-inspired Multiobjective Evolutionary Algorithm for Multiobjective 0/1 Knapsack Problems," in <i>Proceedings of the 2006 IEEE Congress on Evolutionary Computation</i>, IEEE Press, pp. 9151-9156, July 2006.', files: [{ url: "assets/docs/CEC2006_QMEA.pdf", icon: "📄", tip: "PDF" }] },
  { citation: 'Jun-Su Jang, <b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "Face Detection using Quantum-inspired Evolutionary Algorithm," in <i>Proceedings of the 2004 IEEE Congress on Evolutionary Computation</i>, IEEE Press, pp. 2100-2106, June 2004.', files: [{ url: "assets/docs/CEC2004_Face.pdf", icon: "📄", tip: "PDF" }] },
  { citation: '<b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "On Setting the Parameters of Quantum-inspired Evolutionary Algorithm for Practical Applications," in <i>Proceedings of the 2003 IEEE Congress on Evolutionary Computation</i>, IEEE Press, pp. 178-184, December 2003.', files: [{ url: "assets/docs/CEC2003-QEA.pdf", icon: "📄", tip: "PDF" }] },
  { citation: 'Jun-Su Jang, <b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "Quantum-inspired Evolutionary Algorithm-based Face Verification," <i>Lecture Notes in Computer Science (GECCO 2003)</i>, eds. E. Cantu-Paz et al., Berlin Heidelberg: Springer-Verlag, Vol. 2724, pp. 2147-2156, July 2003.', files: [{ url: "assets/docs/GECCO2003_FACE.pdf", icon: "📄", tip: "PDF" }, { url: "assets/images/gecco2003_UIUC.jpg", icon: "🖼️", tip: "GECCO UIUC" }] },
  { citation: '<b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "On Setting the Parameters of QEA for Practical Applications: Some Guidelines based on Empirical Evidence," <i>Lecture Notes in Computer Science (GECCO 2003)</i>, eds. E. Cantu-Paz et al., Berlin Heidelberg: Springer-Verlag, Vol. 2723, pp. 427-428, July 2003.', files: [{ url: "assets/docs/GECCO2003_QEA.pdf", icon: "📄", tip: "PDF" }, { url: "assets/images/gecco2003chicago.jpg", icon: "🖼️", tip: "Chicago" }] },
  { citation: '<b>Kuk-Hyun Han</b>, Yong-Jae Kim, Jong-Hwan Kim and Steve Hsia, "Internet Control of Personal Robot between KAIST and UC Davis," in <i>Proceedings of the IEEE International Conference on Robotics and Automation</i>, IEEE Press, pp. 2184-2189, May 2002.', files: [{ url: "assets/docs/ICRA2002.pdf", icon: "📄", tip: "PDF" }] },
  { citation: '<b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "Introduction of Quantum-inspired Evolutionary Algorithm," in <i>Proceedings of the 2002 FIRA Robot World Congress</i>, pp. 243-248, May 2002.', files: [{ url: "assets/docs/QEAFIRA.pdf", icon: "📄", tip: "PDF" }] },
  { citation: '<b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "Direct Internet Control Architecture for Personal Robot," in <i>Proceedings of the 2002 FIRA Robot World Congress</i>, pp. 264-268, May 2002.', files: [{ url: "assets/docs/IPRFIRA.pdf", icon: "📄", tip: "PDF" }] },
  { citation: '<b>Kuk-Hyun Han</b>, Kang-Hee Lee, Choon-Kyoung Moon, Hoon-Bong Lee and Jong-Hwan Kim, "Robot Soccer System of SOTY 5 for Middle League MiroSot," in <i>Proceedings of the 2002 FIRA Robot World Congress</i>, pp. 632-635, May 2002.', files: [{ url: "assets/docs/Soty5FIRA.pdf", icon: "📄", tip: "PDF" }, { url: "assets/images/simulator1.bmp", icon: "🖼️", tip: "Simulator" }, { url: "assets/images/fira2002.jpg", icon: "🖼️", tip: "FIRA 2002" }] },
  { citation: '<b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "Analysis of Quantum-inspired Evolutionary Algorithm," in <i>Proceedings of the 2001 International Conference on Artificial Intelligence</i>, CSREA Press, Vol. 2, pp. 727-730, June 2001.', files: [{ url: "assets/docs/IC-AI2001.pdf", icon: "📄", tip: "PDF" }, { url: "assets/images/icai1.jpg", icon: "🖼️", tip: "사진 1" }, { url: "assets/images/icai2.jpg", icon: "🖼️", tip: "사진 2" }] },
  { citation: '<b>Kuk-Hyun Han</b>, Shin Kim, Yong-Jae Kim, Seong-Eun Lee and Jong-Hwan Kim, "Implementation of Internet-Based Personal Robot with Internet Control Architecture," in <i>Proceedings of the IEEE International Conference on Robotics and Automation</i>, IEEE Press, pp. 217-222, May 2001.', files: [{ url: "assets/docs/ICRA2001.pdf", icon: "📄", tip: "PDF" }] },
  { citation: 'Jong-Hwan Kim, <b>Kuk-Hyun Han</b>, Shin Kim and Yong-Jae Kim, "Internet-Based Personal Robot System using Map-Based Localization," in <i>Proceedings of the 32nd International Symposium on Robotics</i>, pp. 1282-1287, April 2001.', files: [{ url: "assets/docs/ISR2001.pdf", icon: "📄", tip: "PDF" }] },
  { citation: '<b>Kuk-Hyun Han</b>, Kui-Hong Park, Chi-Ho Lee and Jong-Hwan Kim, "Parallel Quantum-inspired Genetic Algorithm for Combinatorial Optimization Problem," in <i>Proceedings of the 2001 IEEE Congress on Evolutionary Computation</i>, IEEE Press, pp. 1422-1429, May 2001.', files: [{ url: "assets/docs/CEC2001.pdf", icon: "📄", tip: "PDF" }, { url: "assets/images/cec2001.jpg", icon: "🖼️", tip: "사진" }] },
  { citation: '<b>Kuk-Hyun Han</b> and Jong-Hwan Kim, "Genetic Quantum Algorithm and its Application to Combinatorial Optimization Problem," in <i>Proceedings of the 2000 IEEE Congress on Evolutionary Computation</i>, IEEE Press, pp. 1354-1360, July 2000.', files: [{ url: "assets/docs/cec2000.pdf", icon: "📄", tip: "PDF" }, { url: "assets/docs/knapsack_data.zip", icon: "📦", tip: "Knapsack Data" }, { url: "assets/images/cec2000.jpg", icon: "🖼️", tip: "사진" }] },
  { citation: '<b>Kuk-Hyun Han</b>, Jung-Yi Choi, Hoon Kang, Pil-Soon Choi, Se-Joong Lee and Seok-Hyun Moon, "Micro-Robot Design and Strategy for MIROSOT," in <i>Proceedings of the 1996 Micro-Robot World Cup Soccer Tournament</i>, KAIST, pp. 49-52, November 1996.', files: [] }
];

const domesticPapers = [
  { citation: '<b>Kuk-Hyun Han</b>, Jin Wook Baek, Sang-Yun Park, Tae Wan Lim and Jumin Park, "A case study on productivity innovation through convergence of sand 3D printing technology," <i>Journal of the Korean Society for Precision Engineering</i>, Vol. 38, No. 9, pp. 651-657, September 2021. <a href="http://doi.org/10.7736/JKSPE.021.073">DOI</a>', files: [{ url: "http://jkspe.kspe.or.kr/xml/30203/30203.pdf", icon: "📄", tip: "PDF" }] },
  { citation: '<b>Kuk-Hyun Han</b>, Yewon Shim and Jumin Park, "A study on mechanical properties and permeability of mold and core printed by sand 3D printer," in <i>Virtual Conference of the Korean Institute of Metals and Materials</i>, October 2020.', files: [{ url: "assets/docs/KIMM_Conf2020_Fall.pdf", icon: "📄", tip: "PDF" }] },
  { citation: '<b>Kuk-Hyun Han</b>, Jin Wook Baek, Sang-Yun Park, Tae Wan Lim and Jumin Park, "A case study on productivity innovation through convergence of sand 3D printing technology," in <i>Proceedings of the Korean Society for Precision Engineering</i>, September 2020. (Best Paper Award)', files: [{ url: "assets/docs/BestPaperAward_KSPE2020.pdf", icon: "📄", tip: "PDF" }] },
  { citation: '<b>Kuk-Hyun Han</b>, Jumin Park, Tae Wan Lim, Yewon Shim, Jin Wook Baek and Yubin Hwang, "A Study on the convergence design method of casting material and structural shape using sand 3D Printing," in <i>Virtual Conference of the Korean Institute of Metals and Materials</i>, July 2020.', files: [{ url: "assets/docs/KIMM_Conf2020_Spring.pdf", icon: "📄", tip: "PDF" }] },
  { citation: 'Sang-Yun Park, Jin Wook Baek, Tae Wan Lim and <b>Kuk-Hyun Han</b>, "Productivity improvement in casting of cylinder head using hybrid mold based on sand 3D printing," in <i>Conference of Korea Foundry Society</i>, October 2019.', files: [] },
  { citation: 'Yewon Shim, Jumin Park and <b>Kuk-Hyun Han</b>, "A Comparative study on the permeability of the sand 3D printing core and mold by sand properties," in <i>Conference of Korea Foundry Society</i>, October 2019.', files: [] },
  { citation: 'Jumin Park, Yewon Shim, Yongsu Kim and <b>Kuk-Hyun Han</b>, "A Study on the mechanical properties of the sand 3D printing core and mold," in <i>Conference of Korea Foundry Society</i>, April 2019.', files: [{ url: "assets/docs/KFS2019_Poster.pdf", icon: "📄", tip: "Poster PDF" }] },
  { citation: 'Sang-Yun Park, <b>Kuk-Hyun Han</b> and Ohseop Song, "Design of Torsional Viscous Damper of Engine-driveshaft System with Time-varying Inertia," in <i>Transactions of the Korean Society for Noise and Vibration Engineering</i>, October 2017. <a href="https://doi.org/10.5050/KSNVE.2017.27.5.593">DOI</a>', files: [] },
  { citation: 'Sang-Yun Park, <b>Kuk-Hyun Han</b>, Ju-Min Park, Sung-Hun Kwon and Ohseop Song, "Optimum Design of Viscous Fluid Damper for Reducing the Torsional Vibration of Propulsion Shaft System," in <i>Transactions of the Korean Society for Noise and Vibration Engineering</i>, pp. 606-613, September 2015.', files: [{ url: "assets/docs/SOJDCM_2015_v25n9_606.pdf", icon: "📄", tip: "PDF" }] },
  { citation: 'Pil Seung Yang and <b>Kuk-Hyun Han</b>, "Information Input Interactions based on Image Sensors," in <i>Proceedings of the HCI2009</i>, January 2009.', files: [{ url: "assets/docs/HCI2009_InfoPicker.pdf", icon: "📄", tip: "PDF" }] },
  { citation: 'Bo Hyun Kyung, Ki-Wook Na, <b>Kuk-Hyun Han</b>, Seung-Hwan Hong, Sang-Jun Han and Bo Mi Kim, "SimpleKey: Touch Gesture-oriented Hangul Input Method based on Consonants," in <i>Proceedings of the KIPS</i>, KIPS, November 2008.', files: [{ url: "assets/docs/KIPS2008_SimpleKey.pdf", icon: "📄", tip: "PDF" }] },
  { citation: 'Yehoon Kim, Jong-Hwan Kim and <b>Kuk-Hyun Han</b>, "Quantum-inspired Multiobjective Evolutionary Algorithm," in <i>Proceedings of the KACC</i>, ICASE, October 2005. (Korean)', files: [{ url: "assets/docs/QMOEAKACC05.pdf", icon: "📄", tip: "PDF" }] },
  { citation: 'Jong-In Lee, Jung-Min Shin, <b>Kuk-Hyun Han</b> and Jae-Ook Kwon, "Implementation of OSAL to Migrate Embedded S/W from Process-based System to Thread-based System," in <i>Conference of Korean Institute of Communication and Sciences (KICS)</i>, October 2004. (Korean)', files: [{ url: "assets/docs/KICS2004_OSAL.pdf", icon: "📄", tip: "PDF" }] },
  { citation: '<b>Kuk-Hyun Han</b>, Kang-Hee Lee, Choon-Kyung Moon, Hoon-Bong Lee and Jong-Hwan Kim, "Strategy for Middle League MiroSot," in <i>Proceedings of the 4th Workshop on Soccer Robotics</i>, Daeyoung Press, pp. 137-142, January 2002. (Korean)', files: [{ url: "assets/docs/soccerKWS2001.pdf", icon: "📄", tip: "PDF" }] },
  { citation: '<b>Kuk-Hyun Han</b>, Bo-Ik Seo, Taek-Hun Lee and Se-Jong Oh, "Improvement of MIRAGE I Robot System," in <i>Proceedings of the KACC</i>, ICASE, pp. 605-607, 1997. (Korean)', files: [] },
  { citation: '<b>Kuk-Hyun Han</b>, Seo-Rho Lee, Hoon Kang, Joo-Hyung Park and Pil-Soon Choi, "마이크로 로봇 축구 대회용 로봇의 제작과 전략 알고리즘," in <i>Proceedings of the MIROSOT\'96</i>, KAIST, pp. 28-34, 1996. (Korean)', files: [] }
];

const magazineArticles = [
  { citation: '[Interview] <b>Kuk-Hyun Han</b>, "Engine parts maker meets sand 3D printing: Samyoung Machinery pushes the limits of innovation," in <i>FA Journal Smart Factory</i>, pp. 48-49, August 2020.', files: [{ url: "assets/docs/FA_202008.pdf", icon: "📄", tip: "PDF" }] },
  { citation: '<b>Kuk-Hyun Han</b>, "Industry-specific innovation through 3D printing: Mass production and expansion of applications to various industries," in <i>CAD&Graphics</i>, pp. 23-27, July 2020.', files: [{ url: "assets/docs/CG_202007.pdf", icon: "📄", tip: "PDF" }] },
  { citation: '<b>Kuk-Hyun Han</b>, Jung-Yi Choi, Pil-Soon Choi and Se-Joong Lee, "Development of Soccer Robot – MIRAGE I (1)," <i>Semiconductor Network</i>, pp. 132-135, January 2002. (Korean)', files: [{ url: "assets/docs/semi_0201.pdf", icon: "📄", tip: "PDF" }] },
  { citation: '<b>Kuk-Hyun Han</b>, Jung-Yi Choi, Pil-Soon Choi and Se-Joong Lee, "Development of Soccer Robot – MIRAGE I (2)," <i>Semiconductor Network</i>, pp. 134-139, February 2002. (Korean)', files: [{ url: "assets/docs/semi_0202.pdf", icon: "📄", tip: "PDF" }] },
  { citation: '<b>Kuk-Hyun Han</b>, Jung-Yi Choi, Pil-Soon Choi and Se-Joong Lee, "Development of Soccer Robot – MIRAGE I (3)," <i>Semiconductor Network</i>, pp. 136-141, March 2002. (Korean)', files: [{ url: "assets/docs/semi_0203.pdf", icon: "📄", tip: "PDF" }] }
];

const books = [
  { citation: '<b>한국현</b>, <a href="https://www.yes24.com/Product/Goods/116446689"><i>세상을 바꿀 미래기술 12가지: 인공지능부터 양자컴퓨터까지, 누구나 알아야 할 미래기술의 모든 것</i></a>, <a href="https://wikibook.co.kr/futuretech12/">위키북스</a>, 2023.', files: [{ url: "assets/images/BookCoverTech.jpg", icon: "🖼️", tip: "표지" }] },
  { citation: '<b>Kuk-Hyun Han</b>, "Industry-specific innovation through 3D printing: Mass production and expanding application fields to various industries," pp. 36-40 in <i>3D Printing Guide V4 (edited by CAD&Graphics)</i>, ENG Media, 2020.', files: [{ url: "assets/docs/3DPGv4_2020.pdf", icon: "📄", tip: "PDF" }] },
  { citation: 'Jong-Hwan Kim, <b>Kuk-Hyun Han</b>, Yong-Jae Kim, Shin Kim, Kui-Hong Park, Kang-Hee Lee, Jun-su Jang, and Yong-Duk Kim, <i>Internet-based Personal Robot</i>, KAIST Press, 2004. (Korean; 인터넷 기반 퍼스널 로봇)', files: [{ url: "assets/images/BookCoverIPR.jpg", icon: "🖼️", tip: "표지" }] },
  { citation: 'Shin Han and <b>Kuk-Hyun Han</b>, <i>Internet Search Engines</i>, F-ONE Press, 1997. (Korean; 인터넷 검색 엔진)', files: [{ url: "assets/images/BookCoverS.jpg", icon: "🖼️", tip: "표지" }] }
];

/* ──────────── PATENTS ──────────── */
const patentNote = "More than 100 Patents registered and pending (KAIST, Samsung, Samyoung and Lumos Candle)";
const patentSearchUrls = [
  { label: "Google Patents – 전체 특허 검색 결과 보기 (All Patents)", url: "https://patents.google.com/?inventor=%ED%95%9C%EA%B5%AD%ED%98%84&inventor=Kuk-Hyun+Han&inventor=Kuk+Hyun+Han&assignee=%EC%82%BC%EC%84%B1%EC%A0%84%EC%9E%90&assignee=Samsung&assignee=%EC%82%BC%EC%98%81%EA%B8%B0%EA%B3%84&assignee=Samyoung+Machinery&assignee=KAIST&assignee=Lumos+Candle&assignee=%EB%A3%A8%EB%AA%A8%EC%8A%A4%EC%BA%94%EB%93%A4" }
];

/* ──────────── HONORS ──────────── */
const honors = [
  { title: '2018 Albert Nelson Marquis Lifetime Achievement Award, <a href="http://www.marquiswhoswho.com/">Marquis</a>, USA (등재)', files: [] },
  { title: 'Marquis Who\'s Who in the World 2018, <a href="http://www.marquiswhoswho.com/">Marquis</a>, USA (등재)', files: [] },
  { title: 'TOP 100 Engineers 2012, <a href="http://www.internationalbiographicalcentre.com/">IBC</a>, Cambridge, England, 2012 (등재)', files: [{ url: "assets/images/IBC-TOP100_2012.jpg", icon: "🖼️", tip: "IBC TOP100 2012" }] },
  { title: '<a href="http://www.marquiswhoswho.com/references/publications/63-whos-who-in-asia-2012">Marquis Who\'s Who in Asia 2012, 2nd ed.</a>, <a href="http://www.marquiswhoswho.com/">Marquis</a>, USA (등재)', files: [] },
  { title: 'TOP 100 Engineers 2009, <a href="http://www.internationalbiographicalcentre.com/">IBC</a>, Cambridge, England, 2009 (등재)', files: [{ url: "assets/images/top100engineers2009.jpg", icon: "🖼️", tip: "IBC TOP100 2009" }] },
  { title: '<a href="http://www.marquiswhoswho.com/products/WOprodinfo.asp">Marquis Who\'s Who in the World</a> 2009, 26th ed., <a href="http://www.marquiswhoswho.com/">Marquis</a>, USA (등재)', files: [] },
  { title: '<a href="http://www.marquiswhoswho.com/products/WOprodinfo.asp">Marquis Who\'s Who in the World</a> 2008, 25th ed., <a href="http://www.marquiswhoswho.com/">Marquis</a>, USA (등재)', files: [] },
  { title: '<a href="http://www.marquiswhoswho.com/products/elprodinfo.asp">Marquis Who\'s Who of Emerging Leaders</a> 2007, 1st ed., <a href="http://www.marquiswhoswho.com/">Marquis</a>, USA (등재)', files: [] },
  { title: '<a href="http://www.marquiswhoswho.com/products/ASprodinfo.asp">Marquis Who\'s Who in Asia</a> 2007, 1st ed., <a href="http://www.marquiswhoswho.com/">Marquis</a>, USA (등재)', files: [] },
  { title: '<a href="http://www.marquiswhoswho.com/products/WOprodinfo.asp">Marquis Who\'s Who in the World</a> 2007, 24th ed., <a href="http://www.marquiswhoswho.com/">Marquis</a>, USA (등재)', files: [] },
  { title: '<a href="http://www.marquiswhoswho.com/products/SCprodinfo.asp">Marquis Who\'s Who in Science and Engineering</a> 2006-2007, 9th ed., <a href="http://www.marquiswhoswho.com/">Marquis</a>, USA (등재)', files: [] },
  { title: '<a href="http://www.internationalbiographicalcentre.com/pages/publica.html">2000 Outstanding Intellectuals of the 21st Century</a>, <a href="http://www.internationalbiographicalcentre.com/">IBC</a>, Cambridge, England, 2006 (등재)', files: [{ url: "assets/images/ibc2006.jpg", icon: "🖼️", tip: "IBC 2006" }] },
  { title: '<a href="http://www.marquiswhoswho.com/products/WOprodinfo.asp">Marquis Who\'s Who in the World</a> 2006, 23rd ed., <a href="http://www.marquiswhoswho.com/">Marquis</a>, USA (등재)', files: [{ url: "assets/images/whoswhointheworld2006.jpg", icon: "🖼️", tip: "Who\'s Who 2006" }] }
];

/* ──────────── 조교활동 ──────────── */
const taActivities = [
  { period: "2002.03.~2002.06.", title: "지능시스템 (EE481)", files: [] },
  { period: "2001.09.~2001.12.", title: "기초전자공학실습 (EE103)", files: [{ url: "assets/images/mirorobot.gif", icon: "🖼️", tip: "MiroRobot" }] },
  { period: "2001.03.~2001.06.", title: "제어시스템공학 (EE381)", files: [] },
  { period: "2000.09.~2000.12.", title: "기초전자공학실습 (EE103)", files: [] },
  { period: "2000.03.~2000.06.", title: "기초전자공학실습 (EE103)", files: [] },
  { period: "1999.09.~1999.12.", title: "계측개론 (CC522)", files: [] },
  { period: "1999.03.~1999.06.", title: "회로이론 (EE201)", files: [] },
  { period: "1998.09.~1998.12.", title: "전자공학실험 II (EE208)", files: [] },
  { period: "1998.03.~1998.06.", title: "전자공학실험 III (EE307)", files: [] }
];

/* ──────────── 동아리활동 ──────────── */
const clubs = [
  { title: '<a href="http://mirage.kaist.ac.kr/">MIRAGE</a> (MIcro Robot AGgrEgation, 마이크로로봇을 만드는 동아리) 초대회장', desc: 'MIRAGE I 로봇 시스템 설계 및 제작, 세계 마이크로로봇 축구 대회 참가' }
];

/* ──────────── Google Scholar ──────────── */
const scholarUrl = "https://scholar.google.co.kr/citations?user=xvZ1DRwAAAAJ&hl=ko";
