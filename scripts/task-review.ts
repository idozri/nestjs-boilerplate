import * as fs from 'fs';
import * as path from 'path';

const TASKS_PATH = path.resolve(__dirname, '../TASKS.md');

function parseTasks(markdown: string) {
  const lines = markdown.split('\n');
  return lines
    .filter((line) => line.trim().startsWith('- ['))
    .map((line) => ({
      text: line.trim().slice(6).trim(),
      done: line.includes('[x]'),
    }));
}

function groupByPhase(tasks: { text: string; done: boolean }[]) {
  const groups: { [key: string]: { text: string; done: boolean }[] } = {};
  let currentPhase = 'Ungrouped';
  const lines = fs.readFileSync(TASKS_PATH, 'utf-8').split('\n');

  for (let line of lines) {
    if (line.startsWith('## ')) {
      currentPhase = line.replace('##', '').trim();
      groups[currentPhase] = [];
    } else if (line.startsWith('- [')) {
      const task = {
        text: line.trim().slice(6).trim(),
        done: line.includes('[x]'),
      };
      if (!groups[currentPhase]) groups[currentPhase] = [];
      groups[currentPhase].push(task);
    }
  }
  return groups;
}

function logStatus() {
  const content = fs.readFileSync(TASKS_PATH, 'utf-8');
  const tasks = parseTasks(content);
  const grouped = groupByPhase(tasks);

  console.log('\n📋 TASK REVIEW REPORT\n');
  for (const phase in grouped) {
    console.log(`== ${phase} ==`);
    grouped[phase].forEach((task) => {
      const status = task.done ? '✅ DONE' : '⬜ TODO';
      console.log(`${status} - ${task.text}`);
    });
    console.log('');
  }
}

logStatus();
