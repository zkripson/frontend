const Turn = ({ yourTurn }: { yourTurn: boolean }) => (
  <span className="text-[14px] leading-none text-primary-50">
    {yourTurn ? "YOUR TURN" : "⏳ OPPONENT TURN"}
  </span>
);

export default Turn;
