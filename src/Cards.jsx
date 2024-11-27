import { useEffect, useState } from "react";

export default function Cards({ setScore }) {
  const [deck, setDeck] = useState(null); // Deck and clicked cards
  const [isAnimating, setIsAnimating] = useState(false); // Prevent interaction during animation

  // Shuffle function
  const shuffle = (array) => {
    const arrayCopy = [...array];
    for (let i = arrayCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
    }
    return arrayCopy;
  };

  // Animate cards
  const animateCards = (shuffledDeck) => {
    const cards = document.querySelectorAll("#cardFace");

    cards.forEach((card, index) => {
      card.animate(
        [
          { transform: "rotateY(0deg)" }, // Front face visible
          { transform: "rotateY(90deg)" }, // Mid flip to back
          { transform: "rotateY(180deg)" }, // Back face visible
          { transform: "rotateY(360deg)" }, // Flip to front
        ],
        {
          duration: 1500, // Full flip duration
          iterations: 1,
          easing: "ease-in-out",
        }
      );

      // Show the "back" card at 600 ms
      setTimeout(() => {
        setDeck((prev) => ({
          ...prev,
          cards: prev.cards.map((c, i) => {
            if (i === index) {
              return {
                ...c,
                image: "https://deckofcardsapi.com/static/img/back.png",
              };
            } else {
              return c;
            }
          }),
        }));
      }, 600);

      // Show the "back" card at 600 ms
      setTimeout(() => {
        setDeck((prev) => ({
          ...prev,
          cards: prev.cards.map((c, i) => ({
            ...c,
            image: shuffledDeck[i].image,
          })),
        }));
      }, 1060);
    });
  };

  // Handle card click
  const handleCardClick = (card) => {
    // If lost, end game
    if (deck.clickedCards.includes(card)) {
      alert("You lose! Try again.");
      fetchDeck();
      setScore(0);
    }

    // Prevent interaction during animation
    if (isAnimating) {
      return;
    } else {
      setIsAnimating(true);
    }

    const shuffledDeck = shuffle(deck.cards);

    animateCards(shuffledDeck);

    // After animation, update state
    setTimeout(() => {
      setScore((prevScore) => prevScore + 1);
      setDeck((prevDeck) => ({
        ...prevDeck,
        cards: shuffledDeck,
        clickedCards: [...prevDeck.clickedCards, card],
      }));

      setIsAnimating(false);
    }, 1500);
  };

  // Fetch a new deck from the API
  const fetchDeck = () => {
    fetch("https://deckofcardsapi.com/api/deck/new/draw/?count=52")
      .then((response) => response.json())
      .then((data) => {
        setDeck({
          cards: data.cards,
          clickedCards: [],
        });
      })
      .catch((error) => console.error(error));
  };

  // Fetch deck on mount
  useEffect(() => {
    fetchDeck();
  }, []);

  // Render cards
  return (
    <div className="flex flex-wrap gap-16 justify-center p-10">
      {deck &&
        deck.cards.slice(0, 5).map((card) => (
          <div
            key={card.code}
            className="flex flex-col 
                      items-center
                      hover:scale-110
                      hover:cursor-pointer
                      hover:skew-x-1
                      hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.75)]
                      transition-transform duration-500 ease-out transform-gpu"
            onClick={() => handleCardClick(card)}
          >
            <img
              src={card.image}
              alt={card.code}
              className="w-20 h-auto transition-all ease-in-out"
              id="cardFace"
            />
          </div>
        ))}
    </div>
  );
}
