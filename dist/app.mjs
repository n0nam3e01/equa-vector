import { questions, getDirections } from './quiz.mjs';
const registrationUrl = 'https://ventorme.ai/register?utm_source=hacknext&utm_campaign=team-158';
const content = document.querySelector('#quiz-content');
const back = document.querySelector('#quiz-back');
const progress = document.querySelector('.progress');
const step = document.querySelector('#quiz-step');
const fill = document.querySelector('#progress-fill');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let answers = [];
let currentAnimation;
const symbols = ['⌘','✳','♡','↗'];
function render(focus = false) {
  const done = answers.length === questions.length;
  currentAnimation?.cancel();
  step.textContent = done ? 'Готово ✓' : `${answers.length + 1} / ${questions.length}`;
  progress.setAttribute('aria-valuenow', String(answers.length));
  fill.style.transform = `scaleX(${answers.length / questions.length})`;
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
    restart.addEventListener('click', () => { answers = []; render(true); });
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
      button.addEventListener('click', () => { answers.push(index); render(true); });
      choices.append(button);
    });
    content.append(choices);
  }
  if (focus) heading.focus({preventScroll:true});
  if (!reduce.matches) currentAnimation = content.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,easing:'cubic-bezier(.23,1,.32,1)'});
}
back.addEventListener('click', () => { answers.pop(); render(true); });
reduce.addEventListener('change', () => { if (reduce.matches) currentAnimation?.cancel(); });
render();
// All content stays visible when JavaScript or motion is unavailable.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (!reduce.matches) entry.target.animate([{opacity:.45,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'cubic-bezier(.23,1,.32,1)'});
      observer.unobserve(entry.target);
    });
  },{threshold:.12});
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}
document.querySelectorAll('details').forEach(details => details.addEventListener('toggle', () => {
  if (details.open && !reduce.matches) details.querySelector('.answer').animate([{opacity:0,transform:'translateY(-4px)'},{opacity:1,transform:'translateY(0)'}],{duration:200,easing:'cubic-bezier(.23,1,.32,1)'});
}));
