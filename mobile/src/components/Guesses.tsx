import { useEffect, useState } from 'react';
import { Box, FlatList, useToast } from 'native-base';

import { api } from '../services/api';
import { Game, GameProps } from './Game';
import { Loading } from './Loading';
import { EmptyMyPoolList } from './EmptyMyPoolList';

type Props = {
  poolId: string;
  code: string;
};

export function Guesses({ poolId, code }: Props) {
  const [games, setGames] = useState<GameProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [firstTeamPoints, setFirstTeamPoints] = useState('');
  const [secondTeamPoints, setSecondTeamPoints] = useState('');
  const toast = useToast();

  async function fetchGames() {
    try {
      setIsLoading(true);
      const response = await api.get(`/pools/${poolId}/games`);
      setGames(response.data.games);
    } catch (error) {
      console.error(error);
      toast.show({
        title: 'Não foi possível carregar os jogos.',
        placement: 'top',
        bgColor: 'red.500',
      });
    } finally {
      setIsLoading(false);
    }
  }

  // eslint-disable-next-line consistent-return
  async function handleGuessConfirm(gameId: string) {
    try {
      setIsLoading(true);
      if (!firstTeamPoints.trim() || !secondTeamPoints.trim()) {
        return toast.show({
          title: 'Informe o placar do palpite.',
          placement: 'top',
          bgColor: 'red.500',
        });
      }
      await api.post(`/pools/${poolId}/games/${gameId}/guesses`, {
        firstTeamPoints: Number(firstTeamPoints),
        secondTeamPoints: Number(secondTeamPoints),
      });
      toast.show({
        title: 'Palpite realizado com sucesso.',
        placement: 'top',
        bgColor: 'green.500',
      });
      await fetchGames();
    } catch (error) {
      console.error(error);
      toast.show({
        title: 'Não foi enviar o palpite.',
        placement: 'top',
        bgColor: 'red.500',
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchGames();
  }, [poolId]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <FlatList
      data={games}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Game
          data={item}
          setFirstTeamPoints={setFirstTeamPoints}
          setSecondTeamPoints={setSecondTeamPoints}
          onGuessConfirm={() => handleGuessConfirm(item.id)}
        />
      )}
      ListEmptyComponent={() => <EmptyMyPoolList code={code} />}
    />
  );
}
