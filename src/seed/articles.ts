import { doc, h, p } from '../lib/richtext'

const daysAgo = (n: number) => {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - n)
  d.setUTCHours(12, 0, 0, 0)
  return d.toISOString()
}

export const SEED_ARTICLES = [
  {
    title: 'Euchre Scoring Explained',
    slug: 'euchre-scoring-explained',
    category: 'rules',
    excerpt: 'From euchres to lone hands, here’s how every point is awarded.',
    publishedAt: daysAgo(3),
    body: doc([
      p(
        'Euchre is played to ten points, and almost every argument at the table comes down to who gets them and why. The scoring itself is short enough to learn in a minute, but the reasoning behind it shapes every bid you will ever make.',
      ),
      h('The four outcomes'),
      p(
        'There are only four things that can happen at the end of a hand, and each has a fixed value. The team that names trump is called the making team. Everything is scored from their point of view.',
      ),
      p(
        'Take three or four of the five tricks and the making team scores one point. This is by far the most common result in euchre, and it is the reason marginal bids are so often worth making: three tricks out of five is not a demanding target when you hold the trump suit.',
      ),
      p(
        'Take all five tricks and the making team scores two points. A sweep, usually called a march, is not rare. If you hold both bowers and the ace of trump, you are already most of the way there.',
      ),
      p(
        'Fail to take three tricks and the defending team scores two points instead. This is a euchre, and it is where the game gets its name. Notice the asymmetry: a successful bid usually earns one point, but a failed bid hands over two.',
      ),
      p(
        'Finally, a player may go alone, setting their partner’s cards face down and playing the hand single-handed. A lone hand that takes all five tricks scores four points. A lone hand that takes three or four scores the ordinary one point, and a lone hand that fails still gives the defenders two.',
      ),
      h('Why the euchre penalty matters more than it looks'),
      p(
        'Newer players tend to think of a failed bid as costing them the one point they were hoping for. It does not. It costs them the point they wanted plus the two points the opponents gain, so the real swing is three.',
      ),
      p(
        'This is the single most useful piece of arithmetic in euchre. When you are deciding whether to order up a marginal hand, you are not weighing one point against nothing. You are weighing a likely one point against a possible three-point swing.',
      ),
      p(
        'It is also why defending well is worth as much as bidding well. A team that euchres its opponents twice in a game has scored four points without ever naming trump.',
      ),
      h('The lone hand maths'),
      p(
        'Four points is the biggest single score available, and it is tempting to chase. But look at what you give up. If you had bid normally with your partner and swept, you would have scored two. Going alone risks the same hand for an extra two points, and it removes your partner’s cards from the table entirely.',
      ),
      p(
        'The extra two points are only worth it when they change the outcome of the game. At 6–6 they rarely do. At 6–9 down they may be the only realistic path to a win, because a normal two-point march still leaves you behind.',
      ),
      h('Keeping score at the table'),
      p(
        'The traditional method uses two spare cards from the pack, usually a four and a six, arranged face down and turned over progressively to show the running total. Most players now simply use a notepad, and there is nothing wrong with that.',
      ),
      p(
        'What matters is that both teams can see the score at all times. Euchre is a game where the correct decision changes completely depending on the scoreboard, and a hidden score is a source of avoidable disputes.',
      ),
      h('A note on house rules'),
      p(
        'Some tables play that a euchre against a lone hand scores four rather than two. Others play to eleven, or use a variant where the dealer must name trump if everyone passes twice. None of these are wrong, but all of them change the correct strategy, so agree on them before the first deal rather than during the third.',
      ),
    ]),
  },
  {
    title: 'How to Play Euchre',
    slug: 'how-to-play-euchre',
    category: 'learn',
    excerpt: 'Rules, setup, and gameplay basics for the Midwest’s favourite card game.',
    publishedAt: daysAgo(9),
    body: doc([
      p(
        'Euchre is a trick-taking game for four players in two partnerships. It is fast, it is social, and it has been the default card game of the American Midwest for well over a century. A full game takes about fifteen minutes.',
      ),
      h('What you need'),
      p(
        'Euchre uses a short deck: the nine, ten, jack, queen, king and ace of each suit, twenty-four cards in total. Most packs sold in the Midwest still include the spare cards used for keeping score.',
      ),
      p(
        'Four players sit around the table in two partnerships, with partners facing each other. You never play against the person opposite you; everything you do is meant to help them.',
      ),
      h('The deal'),
      p(
        'Each player is dealt five cards, usually in two rounds of two and three to keep the deal quick. The next card is turned face up in the middle of the table. This is the upcard, and the remaining three cards are placed face down beside it.',
      ),
      p(
        'The upcard is a proposal. It is asking the table whether anyone wants that card’s suit to be trump for this hand.',
      ),
      h('Naming trump: the first round'),
      p(
        'Starting with the player to the dealer’s left and moving clockwise, each player may either order up the upcard or pass. Ordering it up makes that suit trump for the hand.',
      ),
      p(
        'If you order it up, the dealer picks up the upcard and discards one card face down, so the dealer still holds five. This means ordering up when the dealer is an opponent hands them a known card, which is a real cost and worth thinking about before you speak.',
      ),
      p(
        'If the dealer’s partner wants the suit, they say so and the dealer takes the card as normal. If the dealer wants it themselves, they say "I’ll take it" and pick it up.',
      ),
      h('Naming trump: the second round'),
      p(
        'If all four players pass, the upcard is turned face down and a second round begins. Now each player, again starting left of the dealer, may name any suit other than the one that was just turned down, or pass again.',
      ),
      p(
        'If everyone passes a second time, the hand is thrown in and the deal passes to the left. Many tables play "stick the dealer" instead, where the dealer is forced to name something rather than allow a misdeal.',
      ),
      h('The bowers'),
      p(
        'This is the part that surprises everyone learning euchre from a standard trick-taking background. Once trump is named, the jack of the trump suit becomes the highest card in the game, called the right bower.',
      ),
      p(
        'The jack of the other suit of the same colour becomes the second highest card, called the left bower, and it changes suit. If spades are trump, the jack of clubs is a spade for the whole hand. It is not a club, it cannot be played on a club lead, and it counts as one of your trump.',
      ),
      p(
        'The rest of the trump suit then runs ace, king, queen, ten, nine. Non-trump suits run ace, king, queen, jack, ten, nine as normal.',
      ),
      h('Playing the hand'),
      p(
        'The player to the dealer’s left leads the first trick, unless someone is playing alone, in which case the lead comes from the left of the lone player.',
      ),
      p(
        'You must follow the suit that was led if you can. If you cannot, you may play anything, including a trump. The trick is won by the highest trump played, or if no trump is played, by the highest card of the suit that was led. Whoever wins a trick leads the next one.',
      ),
      p(
        'Take three of the five tricks and your team has made its bid. Take all five and you score double. Fail to take three and the other team scores instead.',
      ),
      h('Going alone'),
      p(
        'Any player who names trump may choose to go alone. Their partner’s cards are placed face down and take no part in the hand. A lone player who wins all five tricks scores four points instead of two.',
      ),
      p(
        'It is a genuine risk. You are giving up a partner who might have won a trick for you, in exchange for two extra points that only matter if you sweep.',
      ),
      h('Where to go next'),
      p(
        'Once the mechanics are comfortable, the game becomes about judgement: when a hand is worth bidding, what to lead, and when the score should override what your cards are telling you. That is where euchre stops being simple and starts being interesting.',
      ),
    ]),
  },
  {
    title: 'The Left Bower Explained',
    slug: 'the-left-bower-explained',
    category: 'learn',
    excerpt: 'The most misunderstood card in euchre, and the one that decides the most hands.',
    publishedAt: daysAgo(16),
    body: doc([
      p(
        'Almost every euchre mistake made by a competent card player comes back to the same card. The left bower behaves unlike anything in bridge, whist or hearts, and until it is second nature it will quietly cost you hands.',
      ),
      h('What it is'),
      p(
        'When trump is named, two cards are promoted. The jack of the trump suit becomes the right bower, the highest card in the game. The jack of the other suit of the same colour becomes the left bower, the second highest.',
      ),
      p(
        'Spades and clubs are the black pair. Hearts and diamonds are the red pair. So if hearts are trump, the left bower is the jack of diamonds. If clubs are trump, it is the jack of spades.',
      ),
      h('It genuinely changes suit'),
      p(
        'This is the part that catches people out, and it is not a technicality. For the duration of that hand, the left bower is a trump card in every sense.',
      ),
      p(
        'If spades are trump and someone leads a club, you may not play the jack of clubs to follow suit, because it is no longer a club. If someone leads a trump and the jack of clubs is your only remaining trump, you are obliged to play it.',
      ),
      p(
        'Players who think of it as "a club that happens to be worth a lot" will revoke, and will also misread how much trump is still out.',
      ),
      h('Counting your trump correctly'),
      p(
        'The practical consequence is in bidding. Suppose hearts are turned up and you hold the jack of diamonds, the king of hearts, and three off-suit cards.',
      ),
      p(
        'A player who counts one trump will pass. A player who counts correctly sees two trump, one of which is the second highest card in the game, and will usually order it up. Failing to count the left bower is the most common bidding error in euchre, and it is invisible because the hand simply looks weaker than it is.',
      ),
      h('The reverse error'),
      p(
        'The mirror mistake is just as expensive. If you hold the jack of diamonds and diamonds are turned down in the first round, that jack is worth very little unless hearts become trump.',
      ),
      p(
        'A jack is a strong card only in relation to trump. On its own, in a suit nobody wants, it is a middling card that will lose to the ace and king.',
      ),
      h('Reading the bowers in play'),
      p(
        'Strong players track both bowers the way a bridge player tracks aces. If the right bower has been played and you hold the left, your card is now the highest remaining trump and can be led with confidence.',
      ),
      p(
        'Equally, if you are defending and neither bower has appeared by the third trick, be cautious: the maker is probably holding at least one of them back to win the tricks that matter.',
      ),
      h('A drill worth doing'),
      p(
        'Deal yourself five cards, turn an upcard, and before looking closely say aloud how many trump you hold. Then check. Most players are wrong more often than they expect, and the error is almost always the left bower.',
      ),
    ]),
  },
  {
    title: 'When Should You Go Alone?',
    slug: 'when-should-you-go-alone',
    category: 'strategy',
    excerpt: 'Risks, rewards, and a simple test for deciding at the table.',
    publishedAt: daysAgo(23),
    body: doc([
      p(
        'Going alone is the most exciting call in euchre and the most frequently misplayed. Four points is a large prize, and the temptation to reach for it is strong enough that many players call lone hands they should not.',
      ),
      h('What you are actually risking'),
      p(
        'Compare the alternatives honestly. If you bid normally with your partner and take all five tricks, you score two. If you go alone and take all five, you score four. So going alone is worth exactly two extra points.',
      ),
      p(
        'What you give up for those two points is your partner’s entire hand. That is five cards removed from your side of the table, including any trump they held and any ace that might have won a trick you cannot.',
      ),
      p(
        'And the downside is unchanged: fail to take three tricks and the opponents still score two, exactly as they would have done otherwise.',
      ),
      h('The simple test'),
      p(
        'Before calling a lone hand, ask one question: can you see five tricks without any help at all?',
      ),
      p(
        'Both bowers plus the ace of trump is a genuine lone hand. Those are the three highest cards in the game, and after three rounds of trump the opponents will usually have nothing left that can beat your remaining cards.',
      ),
      p(
        'Both bowers and two small trump is usually not a lone hand. You have three near-certain tricks and then you are relying on an off-suit card to hold up, which it often will not.',
      ),
      p(
        'Both bowers and an off-suit ace is the genuinely difficult case, and the answer depends almost entirely on the score.',
      ),
      h('Read the scoreboard before you read your cards'),
      p(
        'This is the part that separates strong players from card-counters. The same five cards are a clear lone hand in one situation and a clear mistake in another.',
      ),
      p(
        'At 9–9, the extra two points are worthless. One point already wins the game. Bid normally, take your partner’s help, and win.',
      ),
      p(
        'At 6–9 down, the extra two points may be everything. A normal march scores two and leaves you at eight while they sit on nine, still needing another hand. A lone march wins the game outright. Here you should stretch for it.',
      ),
      p(
        'At 8–3 up, do not gamble. You are comfortably ahead and a euchre gives them momentum you do not need to hand over.',
      ),
      h('Position matters too'),
      p(
        'Going alone from the first seat, immediately left of the dealer, is the strongest position because you lead the first trick. You can pull trump on your own terms before anyone discards to prepare for you.',
      ),
      p(
        'Going alone as the dealer is weaker than it looks, because the opening lead comes from your left and the defenders get to choose the suit that tests you first.',
      ),
      h('What defenders should do about it'),
      p(
        'When an opponent goes alone, your job changes completely. You are not trying to win the hand; you are trying to win one trick, because one trick reduces their four points to nothing.',
      ),
      p(
        'Lead your off-suit ace immediately. It is your best chance, and it is a chance that disappears the moment they strip the trump. Holding it back for a later trick that never comes is the most common defensive error against a lone hand.',
      ),
      h('The honest summary'),
      p(
        'Call it when you can count five tricks alone, or when the score means two extra points change the result. Otherwise take your partner along. Euchre is a partnership game, and the four-point hand is a bonus, not a target.',
      ),
    ]),
  },
  {
    title: 'Best Opening Leads',
    slug: 'best-opening-leads',
    category: 'strategy',
    excerpt: 'Set the tone of the hand with a strong start.',
    publishedAt: daysAgo(30),
    body: doc([
      p(
        'The opening lead is the only card in euchre you play with no information whatsoever. Nobody has shown you anything. It is also, for that reason, the card most often thrown out of habit rather than thought.',
      ),
      h('First decide which side you are on'),
      p(
        'Everything about the opening lead depends on whether your team named trump. The making team wants trump gone. The defending team wants it to stay.',
      ),
      h('Leading as the maker'),
      p(
        'If you named trump and hold both bowers, lead trump immediately. Pulling the opponents’ trump early protects the small cards you will need to win the fourth and fifth tricks.',
      ),
      p(
        'The logic is simple: your side’s strength is concentrated in high trump, and every round of trump you force is a round in which the opponents cannot ruff your ace later.',
      ),
      p(
        'If you named trump on a thinner hand, say one bower and two small trump, leading trump is less clear. You may be drawing your partner’s only trump out along with the opponents’, which helps nobody.',
      ),
      h('Leading against the makers'),
      p(
        'As a defender, lead an off-suit ace if you have one. It takes a trick now, while the makers still hold cards in that suit and cannot yet trump it. Aces held back against a strong trump hand tend to die unplayed.',
      ),
      p(
        'If you have no ace, lead from your longest non-trump suit. The more cards you hold in a suit, the fewer your opponents hold, and the better the chance your partner can contribute something useful.',
      ),
      h('The mistake almost everyone makes'),
      p(
        'Leading a singleton trump into the bidding team is the classic error, and it feels productive because it is an active, aggressive-looking play.',
      ),
      p(
        'It is not. You are spending your only trump on a trick you will almost certainly lose, and you are clearing the suit for the very team that wants it cleared. Keep that trump and use it to ruff a suit later, when it can actually win something.',
      ),
      h('Leading against a lone hand'),
      p(
        'This deserves its own rule, because the goal changes. Against a lone hand you are not trying to win three tricks; you are trying to win one, and one is enough to cut four points down to zero.',
      ),
      p(
        'Lead your highest off-suit card, usually an ace, on the very first trick. It is your best and often only chance.',
      ),
      h('Watch what your partner leads'),
      p(
        'A lead is information. If your partner leads an ace, they are probably short in trump and looking for a quick trick. If they lead a low card in a suit, they are often hoping you hold the ace.',
      ),
      p(
        'Euchre has no formal signalling conventions in the way bridge does, but consistent leads between regular partners quickly become a language of their own.',
      ),
    ]),
  },
  {
    title: 'Stick the Dealer, Explained',
    slug: 'stick-the-dealer-explained',
    category: 'rules',
    excerpt: 'The house rule that changes second-round bidding completely.',
    publishedAt: daysAgo(38),
    body: doc([
      p(
        'Stick the dealer is the most widespread house rule in euchre, common enough that many players are surprised to learn it is optional at all.',
      ),
      h('The rule'),
      p(
        'Under stick the dealer, if all four players pass in the first round and the first three pass in the second, the dealer must name a suit. Throwing the hand in is not permitted.',
      ),
      p(
        'Without the rule, a hand in which everybody passes twice is simply redealt by the next player.',
      ),
      h('Why tables adopt it'),
      p(
        'The plain reason is pace. Passed-out hands are dull, and a table that throws in three hands in a row loses its rhythm. Forcing a call guarantees that every deal produces a result.',
      ),
      p(
        'The better reason is that it rewards judgement. A forced call is a genuinely difficult decision, and the rule creates several of them per game.',
      ),
      h('How it changes the bidding'),
      p(
        'The effect on strategy is larger than it first appears, and it runs in both directions.',
      ),
      p(
        'Players ahead of the dealer become more willing to pass marginal hands, because they know somebody else is obliged to take the risk. Why bid a thin hand when the dealer must bid a possibly thinner one?',
      ),
      p(
        'The dealer, meanwhile, must plan ahead. If the bidding is coming round and your hand is weak, start thinking about which suit does least damage rather than which suit you want.',
      ),
      h('Surviving a forced call'),
      p(
        'When you are stuck, pick the suit in which you hold the most cards, not the suit containing your single highest card. Length beats one good card, because length is what lets you ruff.',
      ),
      p(
        'If it is close, prefer the suit your partner is more likely to hold. A suit that was turned down in the first round is often a reasonable choice, since nobody wanted it and the opposing strength is probably elsewhere.',
      ),
      p(
        'And remember that being euchred on a forced call costs the same two points as being euchred on a bad voluntary one. The goal is damage limitation, not heroics.',
      ),
      h('Agree before you deal'),
      p(
        'Stick the dealer is a house rule, not a universal one. Different regions, leagues and families play differently, and there is no governing body to appeal to.',
      ),
      p(
        'Settle it before the first hand rather than during the third. That particular argument has ended more euchre nights than any misdeal.',
      ),
    ]),
  },
]
