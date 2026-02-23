import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { apiSelectors } from '../../../store/api/apiSelectors';
import { handleDeleteCard, setIsModal } from '../../../store/api/apiSlice';
import { Message, ColumnProps } from '../../../types';
import '../Column.scss';

const Card = lazy(() => import('../../Card/Card'));

const CentralColumn: React.FC<ColumnProps> = ({ searchQuery = '', searchResults = [] }) => {
  const column = 'central';
  const dispatch = useDispatch();
  const messages = useSelector(apiSelectors.getDataMessages);
  const btnFilterFavourites = useSelector(apiSelectors.getBtnFilterFavourites);
  const isModal = useSelector(apiSelectors.getIsModal);
  const isReverse = useSelector(apiSelectors.getIsReverse);
  const { centralCol } = messages;

  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Message[]>([]);

  useEffect(() => {
    let messagesToShow: Message[];

    if (searchQuery) {
      messagesToShow = searchResults;
    } else {
      messagesToShow = centralCol;
    }

    let sortedMessages = [...messagesToShow].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    if (isReverse) {
      sortedMessages = sortedMessages.reverse();
    }

    setFilteredMessages(sortedMessages);

    const favs = sortedMessages.filter(el => el.liked === true);
    setFilteredFavorites(favs);
  }, [searchQuery, searchResults, centralCol, isReverse]);

  const handleDelCard = (data: Message) => {
    dispatch(handleDeleteCard({
      object: data,
      column
    }));
    if (isModal) {
      dispatch(setIsModal(false));
    }
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
          id={`${key}/central`}
          key={key}
          className="card-wrapper"
        >
          <Suspense fallback={<div className="column-base__fallback">Загрузка...</div>}>
            <Card
              className={isModal ? '' : '_mini'}
              column={column}
              time={time(item.date)}
              data={item}
              handleDelCard={handleDelCard}
              onMoveCard={() => {}} 
            />
          </Suspense>
        </div>
      );
    });
  };

  return (
    <div className="central-column">
      <div className="central-column__wrapper">
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

const arePropsEqual = (prevProps: ColumnProps, nextProps: ColumnProps) => {
  return (
    prevProps.searchQuery === nextProps.searchQuery &&
    JSON.stringify(prevProps.searchResults) === JSON.stringify(nextProps.searchResults)
  );
};

export default React.memo(CentralColumn, arePropsEqual);