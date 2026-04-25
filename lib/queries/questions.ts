import { Question } from '@/types'
import * as fs from 'fs'
import * as path from 'path'

export async function getTopics() {
  const filePath = path.join(process.cwd(), 'lib/data/db.json')
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const data = JSON.parse(fileContent)
  return data.topics.map((t: any) => t.name)
}

export async function getQuestionsByTopic(itc: string): Promise<Question[]> {
  const filePath = path.join(process.cwd(), 'lib/data/db.json')
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const data = JSON.parse(fileContent)
  
  const topic = data.topics.find((t: any) => t.name === itc)
  return topic ? topic.questions : []
}

export async function getAllQuestions(): Promise<Question[]> {
  const filePath = path.join(process.cwd(), 'lib/data/db.json')
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const data = JSON.parse(fileContent)
  
  return data.topics.flatMap((t: any) => t.questions)
}
