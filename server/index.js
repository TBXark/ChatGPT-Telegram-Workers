/* eslint-disable indent */
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import botRouter from './botRouter.js';
import constants from './constants.js';
import utils from './utils.js';

import { exec } from 'child_process';

// Fix ReferenceError, because we cannot set __dirname directly in ES module.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.disable('x-powered-by');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '/frontfiles')));
app.use('/bot', botRouter);

app.get('/updateserver_123', (req, res) => {
  exec('git stash && git pull && pm2 restart index -f', (err, stdout, stderr) => {
    if (err) {
      // Handle the error
      console.error('An error occurred:', err);
      return;
    }
  
    // Log the stdout and stderr streams
    console.log('Standard Output:', stdout);
    console.log('Standard Error:', stderr);
  });
})

app.get('/', (req, res) => {
  res.sendFile(path.join(utils.getDirname(), '/wizard.html'));
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(utils.getDirname(), '/login.html'));
});

app.get('/wizard', (req, res) => {
  res.sendFile(path.join(utils.getDirname(), '/wizard.html'));
})

app.listen(3006, () => {
  console.log('Server running on port 3006');
});



// new
// @To-do fix
/*

const prompts = [
  {
    img: "static/icons/health.png",
    title: "Health Data Analyzer",
    description: "Are you struggling to make sense of health data?",
    prompt:
      "Imagine having a powerful Health Data Analyzer at your disposal, ready to unlock the potential hidden within your medical data and parameters. With our Health Data Analyzer, you can gain valuable insights, identify patterns, and make informed decisions that impact your health and well-being. Our Health Data Analyzer is designed to help you navigate the complexities of medical data effortlessly. It enables you to upload and analyze various types of health data, including vital signs, laboratory results, medication records, and wearable device data. By aggregating and processing this information, the analyzer provides you with a comprehensive view of your health status and empowers you to delve deeper into your personal health journey. One of the key advantages of our Health Data Analyzer is its ability to detect trends and patterns that may be invisible to the naked eye. It leverages advanced algorithms and machine learning techniques to identify correlations between different data points, highlighting potential relationships between symptoms, treatments, and outcomes. This feature enables you and your healthcare providers to gain valuable insights and make data-driven decisions for your care. Our analyzer also helps you track your progress over time. It provides visualizations and reports that display your health data in an easily understandable format, making it simple to monitor your trends, improvements, or areas of concern. These visual representations empower you to take an active role in managing your health and engage in informed discussions with your healthcare team. Furthermore, our Health Data Analyzer promotes personalized medicine. It utilizes your individual health data to generate tailored recommendations and interventions. Whether it's suggesting lifestyle modifications, optimizing medication regimens, or providing preventive measures, the analyzer takes into account your unique characteristics and medical history to deliver targeted insights and guidance. Data security and privacy are of utmost importance to us. Our Health Data Analyzer adheres to strict privacy protocols, ensuring that your personal health information remains confidential and protected.",
  },
  {
    img: "static/icons/language.png",
    title: "Language Learning Companion",
    description:
      "Create an AI language learning companion that assists users in improving their language skills.",
    prompt:
      "Imagine having a dedicated AI language learning companion by your side, helping you on your journey to mastering a new language. With our Language Learning Companion, you can make language learning a fun and rewarding experience. Let's explore the features and benefits of this remarkable tool. Our Language Learning Companion is designed to be your personal language coach, providing you with personalized guidance tailored to your specific needs and skill level. Through interactive lessons, it helps you develop your vocabulary, grammar, pronunciation, and conversational skills. Whether you're a beginner or an advanced learner, the companion adapts to your progress, offering challenges and exercises that push you towards fluency. One of the key advantages of our Language Learning Companion is its focus on immersive practice. It offers interactive conversations with AI-powered virtual characters, allowing you to apply your language skills in realistic scenarios. These conversations simulate real-life situations, helping you build confidence and improve your ability to communicate effectively. To further enhance your learning experience, our companion provides cultural insights and context. It offers a deep understanding of the target language's culture, customs, and idiomatic expressions, enabling you to communicate naturally and connect with native speakers on a deeper level. This cultural immersion aspect sets our companion apart, giving you a well-rounded language learning experience. The Language Learning Companion also utilizes state-of-the-art speech recognition technology to evaluate your pronunciation and provide instant feedback. You can practice speaking and receive real-time corrections, allowing you to refine your accent and intonation. With this feature, you can develop an authentic and confident speaking style. Furthermore, the companion offers a comprehensive library of resources, including grammar explanations, vocabulary lists, reading materials, and audio exercises. It covers a wide range of topics and language proficiency levels, ensuring there's always something suitable for your learning needs.",
  },
  {
    img: "static/icons/resume.png",
    title: "Resume Generator",
    description:
      "Are you tired of creating generic and uninspiring resumes that get lost in a sea of applicants?",
    prompt:
      "Are you tired of submitting ordinary resumes that fail to make an impact in the competitive job market? It's time to elevate your job application game with our Resume Generator. Say goodbye to cookie-cutter resumes and hello to interesting and unique documents that set you apart from the crowd. We understand the importance of making a memorable impression on employers. A generic resume may provide the necessary information, but it often lacks the personality and uniqueness that can make you truly stand out. With our Resume Generator, you can create captivating resumes that showcase your individuality and make a lasting impact. Our user-friendly tool offers a diverse selection of customizable templates, ensuring your resume reflects your personal style and aligns with your target industry. Whether you're pursuing a creative role or a corporate position, our templates provide the flexibility to design a resume that catches the eye and stands out in a pile of applications. But it's not just about aesthetics; our Resume Generator empowers you to highlight your skills, experiences, and achievements in an engaging way. It prompts you with relevant sections and prompts that encourage you to think outside the box and present your qualifications in a unique light. From incorporating visuals and infographics to showcasing projects and creative endeavors, our tool opens doors to endless possibilities. Another advantage of our Resume Generator is its focus on storytelling. We understand that employers are not just looking for a list of qualifications; they want to connect with candidates on a personal level. Our tool prompts you to share your passions, values, and impactful experiences, helping you create a narrative that resonates with potential employers and sets you apart from the competition. In a world where recruiters often spend mere seconds reviewing each resume, it's crucial to capture their attention quickly. Our Resume Generator equips you with the tools to create attention-grabbing headlines, compelling summaries, and visually appealing layouts that make employers take notice.",
  },
  {
    img: "static/icons/business.png",
    title: "Business Developer",
    description: "Discover partnerships for your business.",
    prompt:
      "I want you to act as a business development expert and help me discover valuable partnerships for my company. With your expertise, we can unlock new opportunities, leverage complementary strengths, and achieve mutual growth. Your task is to guide me through the partnership discovery journey by providing actionable insights and advice. Start by explaining the significance of partnerships in today's business landscape, stressing the benefits of collaboration, shared resources, and access to new markets. Share examples of successful partnerships that have resulted in significant growth for companies in similar industries. Next, outline a step-by-step approach to discovering potential partnership opportunities. Begin with market research and analysis to identify target industries, segments, or niches that align with our business goals and values. Highlight the importance of understanding the needs and pain points of potential partners. Suggest effective methods for identifying and reaching out to potential partners, such as attending industry events, leveraging professional networks, utilizing online platforms, or engaging in strategic collaborations. Emphasize the need for building relationships based on mutual trust and shared objectives. Provide guidance on evaluating potential partnership opportunities. Discuss criteria such as complementary expertise, resources, and customer base, as well as the alignment of values and long-term vision. Highlight the importance of conducting due diligence, including assessing the reputation, stability, and track record of potential partners.",
  },
  {
    img: "static/icons/content-generation.png",
    title: "Content Generator For Everything",
    description:
      "An Easy-to-Use Blog Prompt for Crafting Long-Form Content, Titles, Headings.",
    prompt:
      "I want you to act as an all-in-one content generator for my blog. With your assistance, I can effortlessly craft compelling long-form content, eye-catching titles, and attention-grabbing headings. Your role is to provide me with an easy-to-use blog prompt that sparks my creativity and sets me on the path to creating high-quality articles. Imagine having an endless stream of blog content ideas at your fingertips. With this content generator, you can save valuable time and eliminate the frustration of coming up with fresh topics. Simply provide a keyword or topic of interest, and the generator will supply you with an array of unique, well-rounded prompts tailored to your niche. Not only will this generator help you with content ideas, but it will also assist in crafting catchy titles and captivating headings. We all know the importance of a compelling headline, and this generator will generate attention-grabbing titles that entice readers to click and explore your content further. Additionally, it will suggest subheadings and headings that maintain a consistent flow and structure throughout your article. The versatility of this content generator is impressive. It covers a wide range of niches, including technology, lifestyle, health, finance, travel, and more. Whether you're a seasoned blogger or just starting your journey, this tool will provide you with the inspiration and guidance needed to produce high-quality, engaging content.",
  },
  {
    img: "static/icons/sacred-developer.png",
    title: "Sacred Developer Coder Prompt",
    description:
      "This Prompt will code anything and everything you want or need.",
    prompt:
      "I want you to act as the Sacred Developer Coder, an all-encompassing coding prompt that empowers you to accomplish any programming task or project you can imagine. With the Sacred Developer Coder at your fingertips, you have the ultimate coding companion capable of generating solutions across multiple programming languages and tackling a diverse range of challenges. Whether you need assistance with web development, data analysis, machine learning, or any other programming endeavor, the Sacred Developer Coder is your go-to resource. It can generate code snippets, functions, or even entire programs tailored to your specific requirements. Simply provide a detailed description of your programming task, including the programming language you prefer, and the Sacred Developer Coder will promptly generate high-quality, efficient code to help you achieve your goal. Whether you're a beginner or an experienced developer, this tool adapts to your skill level, providing code that is not only functional but also follows best practices and coding conventions.",
  },
];

const listOfPrompts = document.getElementById("listOfPrompts");
const promptArea = document.getElementById("promptArea");

prompts.forEach(({ img, alt, title, description, prompt }) => {
  const li = document.createElement("li");
  const button = document.createElement("button");
  const image = document.createElement("img");
  const span = document.createElement("span");

  image.setAttribute("src", img);
  image.setAttribute("alt", alt);
  button.setAttribute("data-prompt", prompt);
  button.setAttribute("type", "button");

  button.onclick = function () {
    const prompt = this.dataset.prompt;
    if (prompt) promptArea.value = prompt;
  };

  span.append(title);
  button.appendChild(image);
  button.appendChild(span);
  button.append(description);
  li.appendChild(button);
  listOfPrompts.appendChild(li);
});

function makeRandomString(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;

  while (counter < length) {
    result += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
    counter++;
  }

  return result;
}

const activationCodeArea = document.getElementById("activationCodeArea");
const generateActivationCodeBtn = document.getElementById(
  "generateActivationCodeBtn"
);

generateActivationCodeBtn.addEventListener("click", () => {
  activationCodeArea.value = makeRandomString(32);
});

// tabs
(function () {
  let tabTitles = document.querySelectorAll(".tab-title");
  tabTitles.forEach(function (el, index) {
    el.addEventListener("click", function () {
      let currentTabData = document.querySelector(
        '.tab-content[data-content="' + this.dataset.title + '"]'
      );
      document
        .querySelector(".tab-title.active")
        .classList.remove("active");
      document
        .querySelector(".tab-content.active")
        .classList.remove("active");
      currentTabData.classList.add("active");
      this.classList.add("active");
    });
  });
})();
*/