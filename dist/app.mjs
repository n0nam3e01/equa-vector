import { questions, getDirections } from './quiz.mjs';
import './faq.mjs';
const registrationUrl = 'https://ventorme.ai/register?utm_source=hacknext&utm_campaign=team-158';
const content = document.querySelector('#quiz-content');
const back = document.querySelector('#quiz-back');
const progress = document.querySelector('.progress');
const step = document.querySelector('#quiz-step');
const fill = document.querySelector('#progress-fill');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let answers = [];
let currentAnimation;
let changingQuestion = false;
const symbols = ['⌘','✳','♡','↗'];
async function changeQuestion(change) {
  if (changingQuestion) return;
  changingQuestion = true;
  content.inert = true;
  currentAnimation?.cancel();
  try {
    if (!reduce.matches) {
      currentAnimation = content.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-5px)'}],{duration:120,easing:'ease-out'});
      await currentAnimation.finished.catch(() => {});
    }
    change();
    content.inert = false;
    render(true);
  } finally {
    content.inert = false;
    changingQuestion = false;
  }
}
function render(focus = false) {
  const done = answers.length === questions.length;
  currentAnimation?.cancel();
  step.textContent = done ? 'Готово ✓' : `${answers.length + 1} / ${questions.length}`;
  progress.setAttribute('aria-valuenow', String(answers.length));
  fill.style.clipPath = `inset(0 ${100 - answers.length / questions.length * 100}% 0 0 round 4px)`;
  back.hidden = answers.length === 0;
  content.replaceChildren();
  const heading = document.createElement('h2');
  heading.tabIndex = -1;
  content.append(heading);
  const explanation = document.createElement('p');
  if (done) {
    const result = getDirections(answers);
    heading.textContent = result.length === 1 ? result[0].title : 'У тебя несколько интересов';
    heading.className = 'result-title';
    explanation.textContent = result.length === 1 ? 'Это направление стоит изучить. Четыре ответа — повод для размышления, а не точный выбор профессии.' : 'Это нормально: не нужно выбирать только один путь. Присмотрись к направлениям ниже.';
    content.append(explanation);
    const examples = document.createElement('div');
    examples.className = 'result-examples';
    examples.textContent = result.length === 1 ? result[0].examples : result.map(d => d.title).join(' · ');
    const next = document.createElement('p');
    next.textContent = 'Продолжи с Ventorme: создай аккаунт и пройди первые шаги знакомства с платформой.';
    const link = document.createElement('a');
    link.className = 'button result-cta';
    link.href = registrationUrl;
    link.textContent = 'Продолжить в Ventorme ↗';
    const restart = document.createElement('button');
    restart.type = 'button';
    restart.className = 'restart';
    restart.textContent = 'Пройти ещё раз';
    restart.addEventListener('click', () => changeQuestion(() => { answers = []; }));
    content.append(examples,next,link,restart);
  } else {
    const question = questions[answers.length];
    heading.textContent = question.title;
    explanation.textContent = 'Выбери ближайший вариант. Правильных ответов нет.';
    content.append(explanation);
    const choices = document.createElement('div');
    choices.className = 'choices';
    question.answers.forEach((answer,index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'choice';
      const icon = document.createElement('span');
      icon.className = 'choice-icon'; icon.setAttribute('aria-hidden','true'); icon.textContent = symbols[index];
      const label = document.createElement('span'); label.textContent = answer;
      button.append(icon,label);
      button.addEventListener('click', () => changeQuestion(() => { answers.push(index); }));
      choices.append(button);
    });
    content.append(choices);
  }
  if (focus) heading.focus({preventScroll:true});
  if (!reduce.matches) currentAnimation = content.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,easing:'cubic-bezier(.23,1,.32,1)'});
}
back.addEventListener('click', () => changeQuestion(() => { answers.pop(); }));
reduce.addEventListener('change', () => { if (reduce.matches) currentAnimation?.cancel(); });
render();
// Scroll effects are optional; the quiz and static content work without them.
import('./scroll.mjs').catch(error => console.warn('Scroll effects unavailable:',error));

const mascotVideo = document.querySelector('#venti-video');
const compactLayout = matchMedia('(max-width: 720px)');
let mascotVisible = true;
function updateMascot() {
  if (reduce.matches || compactLayout.matches || document.hidden || !mascotVisible) {
    mascotVideo.pause();
    if (reduce.matches) mascotVideo.currentTime = 0;
  } else {
    if (!mascotVideo.getAttribute('src')) mascotVideo.src = mascotVideo.dataset.src;
    mascotVideo.play().catch(() => {});
  }
}
reduce.addEventListener('change', updateMascot);
compactLayout.addEventListener('change', updateMascot);
document.addEventListener('visibilitychange', updateMascot);
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
    mascotVisible = entries[0].isIntersecting;
    updateMascot();
  },{threshold:.1}).observe(mascotVideo);
}
updateMascot();
