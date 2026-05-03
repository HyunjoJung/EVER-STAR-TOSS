import React, { useState } from 'react';
import { createRoute } from '@granite-js/react-native';
import { Button } from '@toss/tds-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from 'components/Card';
import { FormField } from 'components/FormField';
import { Screen } from 'components/Screen';
import { APP_ROUTES } from 'config/routes';
import { everStarApi } from 'lib/api';
import { queryKeys } from 'lib/queryKeys';
import { useAppSession } from 'providers/AppSessionProvider';
import type { CreatePetInput, Pet } from 'types/domain';

export const Route = createRoute('/pet-create', {
  component: PetCreatePage,
});

function PetCreatePage() {
  const navigation = Route.useNavigation();
  const queryClient = useQueryClient();
  const { anonymousHash, selectPet } = useAppSession();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [relationship, setRelationship] = useState('');
  const [age, setAge] = useState('');
  const [memorialDate, setMemorialDate] = useState('');
  const [personalities, setPersonalities] = useState('');
  const [introduction, setIntroduction] = useState('');

  const createMutation = useMutation({
    mutationFn: (input: CreatePetInput) => everStarApi.createPet(anonymousHash ?? '', input),
    onSuccess: async (pet: Pet) => {
      selectPet(pet.id);
      await queryClient.invalidateQueries({ queryKey: queryKeys.pets(anonymousHash) });
      navigation.navigate(APP_ROUTES.home);
    },
  });

  const canSubmit = name.trim().length > 0 && species.trim().length > 0 && relationship.trim().length > 0 && memorialDate.trim().length > 0;

  return (
    <Screen
      title="새 별 등록"
      subtitle="기록의 기준이 되는 기본 정보를 남겨주세요."
      footer={
        <Button
          display="full"
          loading={createMutation.isPending}
          disabled={!canSubmit || anonymousHash == null}
          onPress={() =>
            createMutation.mutate({
              name,
              species,
              relationship,
              memorialDate,
              age: age.trim().length > 0 ? Number(age) : null,
              gender: 'UNKNOWN',
              introduction: introduction.trim().length > 0 ? introduction : null,
              personalities: personalities
                .split(',')
                .map(value => value.trim())
                .filter(Boolean),
            })
          }
        >
          등록하기
        </Button>
      }
    >
      <FormField label="이름" value={name} onChangeText={setName} placeholder="예: 쎄피" />
      <FormField label="종" value={species} onChangeText={setSpecies} placeholder="예: 말티즈" />
      <FormField label="관계" value={relationship} onChangeText={setRelationship} placeholder="예: 동생" />
      <FormField label="나이" value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="숫자만 입력" />
      <FormField label="기일" value={memorialDate} onChangeText={setMemorialDate} placeholder="YYYY-MM-DD" />
      <FormField label="성격" value={personalities} onChangeText={setPersonalities} placeholder="활발한, 친화적인" />
      <FormField label="소개" value={introduction} onChangeText={setIntroduction} multiline placeholder="기억하고 싶은 모습을 적어주세요." />
      {createMutation.error != null ? <Card title="등록 실패" description={createMutation.error.message} /> : null}
    </Screen>
  );
}
