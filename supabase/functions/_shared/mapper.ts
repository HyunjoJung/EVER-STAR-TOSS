export function mapPet(row: any, personalities: string[] = []) {
  return {
    id: row.id,
    appUserId: row.app_user_id,
    name: row.name,
    age: row.age,
    species: row.species,
    gender: row.gender,
    relationship: row.relationship,
    memorialDate: row.memorial_date,
    profileImageUrl: row.profile_image_url,
    introduction: row.introduction,
    personalities,
    questStartedAt: row.quest_started_at,
    questIndex: row.quest_index,
    isQuestCompleted: row.is_quest_completed,
  };
}

export function mapAiAnswer(row: any) {
  if (row == null) {
    return null;
  }

  return {
    id: row.id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    kind: row.kind,
    status: row.status,
    content: row.content,
    imagePath: row.image_path,
    error: row.error,
    createdAt: row.created_at,
  };
}

export function mapQuest(row: any) {
  return {
    id: row.id,
    day: row.day,
    content: row.content,
    type: row.type,
  };
}

export function mapQuestAnswer(row: any, aiAnswer: any = null) {
  return {
    id: row.id,
    petId: row.pet_id,
    questId: row.quest_id,
    content: row.content,
    imageUrl: row.image_url,
    type: row.type,
    createdAt: row.created_at,
    aiAnswer: mapAiAnswer(aiAnswer),
  };
}

export function mapLetter(row: any, aiAnswer: any = null) {
  return {
    id: row.id,
    petId: row.pet_id,
    content: row.content,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    aiAnswer: mapAiAnswer(aiAnswer),
  };
}

export function mapNotification(row: any) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    kind: row.kind,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}
