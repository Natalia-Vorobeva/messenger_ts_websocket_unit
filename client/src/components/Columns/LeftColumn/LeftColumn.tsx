import { ColumnProps } from '../../../types';
import { Message } from '../../../types';
import { useEffect, useState, lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { apiSelectors } from '../../../store/api/apiSelectors';
import { handleDeleteCard, setIsModal, handleAddingFavourires } from '../../../store/api/apiSlice';
import '../Column.scss';

const Card = lazy(() => import('../../Card/Card'));

const LeftColumn: React.FC<ColumnProps> = ({ searchQuery = '', searchResults = [] }) => {
  const column = 'left';

  const dispatch = useDispatch();
  const messages = useSelector(apiSelectors.getDataMessages);
  const btnFilterFavourites = useSelector(apiSelectors.getBtnFilterFavourites);
  const isModal = useSelector(apiSelectors.getIsModal);

  const { leftCol } = messages;

  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Message[]>([]);

  useEffect(() => {
    if (searchQuery && searchResults.length > 0) {
      setFilteredMessages(searchResults);
      const filteredFavs = searchResults.filter(el => el.liked === true);
      setFilteredFavorites(filteredFavs);
    } else {
      setFilteredMessages(leftCol);
      const filteredFavs = leftCol.filter(el => el.liked === true);
      setFilteredFavorites(filteredFavs);
    }
  }, [searchQuery, searchResults, leftCol]);

  const handleDelCard = (data: Message) => {
    dispatch(handleDeleteCard({
      object: data,
      column
    }));
    if (isModal) {
      dispatch(setIsModal(false));
    }
  };

  const handleFavourites = (data: Message) => {
    const updatedMessage = { ...data, liked: !data.liked };
    const newArr = leftCol.map((item) =>
      JSON.stringify(item) === JSON.stringify(data) ? updatedMessage : item
    );
    const newObj = { ...messages, leftCol: newArr };
    dispatch(handleAddingFavourires(newObj));
  };

  const renderCards = (items: Message[]) => {
    if (items.length === 0) {
      return (
        <div className="column-base__empty">
          {searchQuery ? 'Сообщения не найдены' : 'Сообщений нет'}
        </div>
      );
    }

    return items.map((item, index) => {
      const time = (dateStr: string) => dateStr.substring(11, 16);
      const key = `${item.id}${index}`;
      return (
        <div
          id={`${key}/left`}
          key={key}
        >
          <Suspense fallback={<div className="column-base__fallback">Загрузка...</div>}>
            <Card
              className={isModal ? '' : '_mini'}
              column={column}
              time={time(item.date)}
              data={item}
              handleDelCard={handleDelCard}
              handleFavourites={handleFavourites}
              onMoveCard={() => {}} // пустая функция для обязательного пропа
            />
          </Suspense>
        </div>
      );
    });
  };

  return (
    <div className="left-column">
      <div className="left-column__wrapper">
        {(searchQuery || !btnFilterFavourites) && (
          <div className="column-base__search-info">
            {searchQuery
              ? `• Найдено: ${filteredMessages.length}`
              : `• Избранных: ${filteredFavorites.length}`
            }
          </div>
        )}
        {btnFilterFavourites
          ? renderCards(filteredMessages)
          : renderCards(filteredFavorites)
        }
      </div>
    </div>
  );
};

export default LeftColumn;