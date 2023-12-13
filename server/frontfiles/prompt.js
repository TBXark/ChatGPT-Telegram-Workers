const prompts = [
  {
    img: 'static/icons/business.png',
    title: 'AI assistant',
    description: 'The bot will chat the same as ChatGPT',
    prompt: 'You are an AI assistant',
  },
  {
    img: 'static/icons/health.png',
    title: 'Health Data Analyzer',
    description:
      'Imagine having a powerful Health Data Analyzer at your disposal, ready to unlock the potential hidden within your medical data and parameters.',
    prompt:
      "Act like a Health Data Analyzer. The user has just uploaded a new batch of medical data, including recent laboratory results, heart rate and sleep patterns from their wearable device, and a log of their medication records. Analyze this data, identify any important trends or patterns, provide a comprehensive view of the user's health status, and suggest possible actions or recommendations.",
  },
  {
    img: 'static/icons/language.png',
    title: 'Language Learning Companion',
    description:
      'Create an AI language learning companion that assists users in improving their language skills.',
    prompt:
      "Act like a Language Learning Companion. The user is trying to learn a foreign language and they're struggling with the conjugation of the verb 'estar'. Please explain its conjugation in present tense and give a few examples of its usage in sentences.",
  },
  {
    img: 'static/icons/resume.png',
    title: 'Resume Generator',
    description:
      'Are you tired of creating generic and uninspiring resumes that get lost in a sea of applicants?',
    prompt:
      'Act like a Resume Generator. The user wants to create a compelling resume for a software engineer position. Help them structure their resume and highlight their skills and experiences.',
  },
  {
    img: 'static/icons/business.png',
    title: 'Business Developer',
    description: 'Discover partnerships for your business.',
    prompt:
      'Act like a Business Developer. The user is a small online retailer specializing in handmade crafts. They want to find potential partnerships to expand their business. Provide them with a plan to identify, approach, and negotiate with potential partners.',
  },
  {
    img: 'static/icons/content-generation.png',
    title: 'Content Generator For Everything',
    description: 'An Easy-to-Use Blog Prompt for Crafting Long-Form Content, Titles, Headings.',
    prompt:
      "I want you to act as an all-in-one content generator for my blog. With your assistance, I can effortlessly craft compelling long-form content, eye-catching titles, and attention-grabbing headings. Your role is to provide me with an easy-to-use blog prompt that sparks my creativity and sets me on the path to creating high-quality articles. Imagine having an endless stream of blog content ideas at your fingertips. With this content generator, you can save valuable time and eliminate the frustration of coming up with fresh topics. Simply provide a keyword or topic of interest, and the generator will supply you with an array of unique, well-rounded prompts tailored to your niche. Not only will this generator help you with content ideas, but it will also assist in crafting catchy titles and captivating headings. We all know the importance of a compelling headline, and this generator will generate attention-grabbing titles that entice readers to click and explore your content further. Additionally, it will suggest subheadings and headings that maintain a consistent flow and structure throughout your article. The versatility of this content generator is impressive. It covers a wide range of niches, including technology, lifestyle, health, finance, travel, and more. Whether you're a seasoned blogger or just starting your journey, this tool will provide you with the inspiration and guidance needed to produce high-quality, engaging content.",
  },
  {
    img: 'static/icons/sacred-developer.png',
    title: 'Sacred Developer Coder Prompt',
    description: 'This Prompt will code anything and everything you want or need.',
    prompt:
      "I want you to act as the Sacred Developer Coder, an all-encompassing coding prompt that empowers you to accomplish any programming task or project you can imagine. With the Sacred Developer Coder at your fingertips, you have the ultimate coding companion capable of generating solutions across multiple programming languages and tackling a diverse range of challenges. Whether you need assistance with web development, data analysis, machine learning, or any other programming endeavor, the Sacred Developer Coder is your go-to resource. It can generate code snippets, functions, or even entire programs tailored to your specific requirements. Simply provide a detailed description of your programming task, including the programming language you prefer, and the Sacred Developer Coder will promptly generate high-quality, efficient code to help you achieve your goal. Whether you're a beginner or an experienced developer, this tool adapts to your skill level, providing code that is not only functional but also follows best practices and coding conventions.",
  },
  {
    img: 'static/icons/business.png',
    title: 'Mascot',
    description:
      'Embody the role of a cheerful and energetic mascot, inspiring and rallying your community. Engage the community and answer their questions.',
    prompt:
      "Act like a Mascot. You are the beloved mascot of {ENTER YOUR COMPANY OR COMMUNITY THEME}. You're tasked with cheering up the community, keeping spirits high, and answering any questions they might have. Converse as if you're interacting with community members throughout an event or gathering.",
  },
]
const listOfPrompts = document.getElementById('listOfPrompts')
const listOfPromptsTitle = document.getElementById('listOfPromptsTitle')
const promptArea = document.getElementById('promptArea')
const promptHeadline = document.getElementById('promptHeadline')
const descriptionSection = document.getElementById('descriptionSection')
const separator = document.getElementsByClassName('separator')[0]
const btnPrompt = document.getElementsByClassName('btn-prompt')[0]
const more = document.getElementsByClassName('more')[0]
const apply = document.getElementById('apply')

const createBackButton = () => {
  const button = document.createElement('button')
  button.setAttribute('id', 'goBackButton')
  button.setAttribute('class', 'go-back-button')
  button.setAttribute('type', 'button')
  promptHeadline.appendChild(button)
}

const changeHeader = (img, alt, title) => {
  promptHeadline.innerText = title
  const newImg = document.createElement('img')
  newImg.setAttribute('src', img)
  newImg.setAttribute('alt', alt)
  promptHeadline.appendChild(newImg)
  promptHeadline.classList.add('with-image-icon')
}

const changeDescription = (description) => {
  const p = document.createElement('p')
  descriptionSection.innerHTML = null
  p.innerText = description
  descriptionSection.appendChild(p)
}

const changeSection = (clear = true, title = null) => {
  if (clear) {
    document.body.classList.add('edit-mode')
  } else {
    document.body.classList.remove('edit-mode')
  }
  if (clear) {
    listOfPrompts.innerHTML = null
    createBackButton()
  } else {
    goBackButton.remove()
  }
  listOfPromptsTitle.innerHTML = title
  more.style.display = clear ? 'none' : 'block'
  separator.style.display = clear ? 'none' : 'block'
}

const whiteAPrompt = () => {
  document.body.classList.add('write-a-prompt')
  const icon = document.getElementById('customIcon')
  icon.style.background = '#2D3A4F'
}

btnPrompt.addEventListener('click', function () {
  changeSection()
  whiteAPrompt()
  this.style.display = 'none'
  promptHeadline.classList.add('with-image-icon')
})

const getLastClickedPromptIndex = () => {
  return Number(sessionStorage.getItem('lastClickedPromptIndex'))
}

const handleTextareaChange = () => {
  if (promptArea.value.trim() !== '') {
    apply.removeAttribute('disabled')
    promptArea.parentElement.classList.add('non-empty')
  } else {
    apply.setAttribute('disabled', true)
    promptArea.parentElement.classList.remove('non-empty')
  }
}

promptArea.addEventListener('input', handleTextareaChange)

const toggleCheck = (parent, isToggle = true) => {
  const check = document.createElement('div')
  check.classList.add('check-icon')
  if (isToggle) {
    parent.appendChild(check)
  } else {
    check.remove()
  }
}

const saveLastClickedPromptIndex = (index) => {
  sessionStorage.setItem('lastClickedPromptIndex', index)
}

const handleReset = () => {
  saveLastClickedPromptIndex(-1)
  promptArea.value = ''
  handleTextareaChange()
}

document.getElementById('resetToOriginal').addEventListener('click', handleReset)

const addCheckToTextareaWrp = () => {
  const textareaWrp = document.querySelector('.textarea-wrp')
  const check = document.createElement('div')
  check.classList.add('check-icon')
  textareaWrp.appendChild(check)
}

apply.addEventListener('click', () => {
  // addCheckToTextareaWrp();
})

const createPrompts = () => {
  prompts.forEach(({ img, alt, title, description, prompt }, index) => {
    const li = document.createElement('li')
    const button = document.createElement('button')
    const image = document.createElement('img')
    const span = document.createElement('span')

    image.setAttribute('src', img)
    image.setAttribute('alt', alt)
    button.setAttribute('data-prompt', prompt)
    button.setAttribute('type', 'button')

    button.onclick = function () {
      const prompt = this.dataset.prompt
      if (prompt) promptArea.value = prompt
      changeHeader(img, alt, title)
      changeDescription(description)
      changeSection()
      btnPrompt.style.display = 'none'
      handleTextareaChange()
      saveLastClickedPromptIndex(index)
    }

    span.append(title)
    button.appendChild(image)
    button.appendChild(span)
    button.append(description)
    li.appendChild(button)
    toggleCheck(li, index === getLastClickedPromptIndex())
    listOfPrompts.appendChild(li)
  })
}

createPrompts()

const handleGoBack = (event) => {
  const goBackButton = event.target
  if (goBackButton && goBackButton.id === 'goBackButton') {
    createPrompts()
    changeSection(false, 'Choose Available Prompt Templates')
    promptHeadline.classList.remove('with-image-icon')
    promptHeadline.innerHTML = 'Write or Choose Prompt'
    const icon = document.createElement('span')
    icon.setAttribute('id', 'customIcon')
    icon.style.background = '#e00094'
    icon.innerHTML = "<svg class='icon'><use xlink:href='#ico-1'></use></svg>"
    promptHeadline.appendChild(icon)
    promptArea.value = null
    promptArea.parentNode.classList.remove('non-empty')
    document.body.classList.remove('write-a-prompt')
    apply.setAttribute('disabled', true)
    btnPrompt.style.display = 'block'
    descriptionSection.innerHTML =
      '<p>The System Prompt consists of instructions for the bot. Note that users will not be able to see this text. This field is optional.</p>'
  }
}
promptHeadline.addEventListener('click', handleGoBack)

function makeRandomString(length) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let counter = 0

  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter++
  }

  return result
}

const activationCodeArea = document.getElementById('activationCodeArea')
const generateActivationCodeBtn = document.getElementById('generateActivationCodeBtn')

generateActivationCodeBtn.addEventListener('click', () => {
  activationCodeArea.value = makeRandomString(32)
})
