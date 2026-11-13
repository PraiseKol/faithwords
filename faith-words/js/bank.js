// Faith Words — word & clue bank.
// Line format:  ANSWER|clue|tags|emoji
//  - empty clue + emoji  => picture clue (like the bull / bee cells in the original game)
//  - the same ANSWER may appear several times with different clues; a puzzle picks one.
// Tags: ot nt ppl plc bk thm obj cur  +  event tags: xmas east pent hero psalm
const RAW = `
ADAM|First man|ot,ppl
EVE|Mother of all living|ot,ppl
CAIN|Killed his brother|ot,ppl
ABEL|Cain's brother|ot,ppl
SETH|Adam's third son|ot,ppl
NOAH|Ark builder|ot,ppl,hero
ENOCH|Walked with God|ot,ppl
ABRAHAM|Father of many nations|ot,ppl,hero
SARAH|Isaac's mother|ot,ppl,hero
HAGAR|Ishmael's mother|ot,ppl
ISAAC|Son of promise|ot,ppl
ISHMAEL|Hagar's son|ot,ppl
REBEKAH|Isaac's wife|ot,ppl
ESAU|Sold his birthright|ot,ppl
JACOB|Renamed Israel|ot,ppl
LABAN|Jacob's father-in-law|ot,ppl
LEAH|Jacob's first wife|ot,ppl
RACHEL|Jacob's beloved wife|ot,ppl
JOSEPH|Dreamer sold into Egypt|ot,ppl,hero
BENJAMIN|Jacob's youngest son|ot,ppl
JUDAH|Tribe of the Lion|ot,ppl
LEVI|Tribe of priests|ot,ppl
REUBEN|Jacob's firstborn|ot,ppl
MOSES|Led Israel out of Egypt|ot,ppl,hero
AARON|Moses' brother, high priest|ot,ppl
MIRIAM|Moses' sister|ot,ppl
JOSHUA|Led Israel into Canaan|ot,ppl,hero
CALEB|Faithful spy|ot,ppl,hero
RAHAB|Hid the spies in Jericho|ot,ppl,hero
DEBORAH|Judge and prophetess|ot,ppl,hero
GIDEON|Defeated Midian with 300|ot,ppl,hero
SAMSON|Strong man of Israel|ot,ppl,hero
DELILAH|Betrayed Samson|ot,ppl
RUTH|Loyal daughter-in-law|ot,ppl,hero
NAOMI|Ruth's mother-in-law|ot,ppl
BOAZ|Ruth's kinsman-redeemer|ot,ppl
HANNAH|Samuel's mother|ot,ppl,hero
ELI|Priest who raised Samuel|ot,ppl
SAMUEL|Boy who heard God's voice|ot,ppl,hero
SAUL|Israel's first king|ot,ppl
DAVID|Giant-killer and king|ot,ppl,hero,psalm
GOLIATH|Philistine giant|ot,ppl
JONATHAN|David's best friend|ot,ppl,hero
ABIGAIL|Wise wife of Nabal|ot,ppl
SOLOMON|Wisest king|ot,ppl
ABSALOM|David's rebel son|ot,ppl
ELIJAH|Taken up in a whirlwind|ot,ppl,hero
ELISHA|Elijah's successor|ot,ppl
JEZEBEL|Wicked queen of Israel|ot,ppl
AHAB|King married to Jezebel|ot,ppl
NAAMAN|Healed in the Jordan|ot,ppl
JONAH|Swallowed by a big fish|ot,ppl
ISAIAH|Prophet of Immanuel|ot,ppl,xmas
JEREMIAH|Weeping prophet|ot,ppl
EZEKIEL|Saw dry bones live|ot,ppl
DANIEL|Survived the lions' den|ot,ppl,hero
HOSEA|Prophet who married Gomer|ot,ppl
JOEL|Prophesied the Spirit's outpouring|ot,ppl,pent
AMOS|Shepherd prophet|ot,ppl
MICAH|Foretold Bethlehem|ot,ppl,xmas
ESTHER|Queen who saved her people|ot,ppl,hero
MORDECAI|Esther's cousin|ot,ppl
HAMAN|Villain of Purim|ot,ppl
NEHEMIAH|Rebuilt Jerusalem's wall|ot,ppl,hero
EZRA|Priest and scribe|ot,ppl
JOB|Man of great patience|ot,ppl,hero
SHADRACH|Furnace survivor|ot,ppl
MESHACH|Furnace survivor|ot,ppl
ABEDNEGO|Furnace survivor|ot,ppl
JESUS|Savior of the world|nt,ppl
MARY|Mother of Jesus|nt,ppl,xmas,east
JOHN|Beloved disciple|nt,ppl
PETER|Denied Jesus three times|nt,ppl,east,pent,hero
ANDREW|Peter's brother|nt,ppl
JAMES|Zebedee's son|nt,ppl
PHILIP|Disciple from Bethsaida|nt,ppl
THOMAS|Doubting disciple|nt,ppl,east
MATTHEW|Tax collector turned apostle|nt,ppl
SIMON|Peter's first name|nt,ppl
JUDAS|Betrayed Jesus|nt,ppl,east
PAUL|Apostle to the Gentiles|nt,ppl,hero
BARNABAS|Son of Encouragement|nt,ppl
SILAS|Paul's jail companion|nt,ppl
TIMOTHY|Paul's young protege|nt,ppl
TITUS|Paul's co-worker in Crete|nt,ppl
LUKE|Physician and Gospel writer|nt,ppl
MARK|Wrote the shortest Gospel|nt,ppl
STEPHEN|First martyr|nt,ppl,hero
LYDIA|Seller of purple|nt,ppl
PRISCILLA|Tentmaker with Aquila|nt,ppl
AQUILA|Priscilla's husband|nt,ppl
APOLLOS|Eloquent teacher|nt,ppl
ZACCHAEUS|Short tax collector|nt,ppl
LAZARUS|Raised from the dead|nt,ppl
MARTHA|Busy sister of Mary|nt,ppl
NICODEMUS|Visited Jesus by night|nt,ppl
HEROD|King who hunted the baby Jesus|nt,ppl,xmas
PILATE|Washed his hands|nt,ppl,east
BARABBAS|Prisoner set free instead|nt,ppl,east
CAIAPHAS|High priest at the trial|nt,ppl,east
GABRIEL|Angel of the Annunciation|nt,ppl,xmas
MICHAEL|Archangel|ppl
ELIZABETH|John the Baptist's mother|nt,ppl,xmas
ZECHARIAH|Struck mute in the temple|nt,ppl,xmas
SIMEON|Held baby Jesus in the temple|nt,ppl,xmas
ANNA|Prophetess in the temple|nt,ppl,xmas
DORCAS|Raised by Peter|nt,ppl
CORNELIUS|Roman centurion|nt,ppl
EUTYCHUS|Fell asleep during Paul's sermon|nt,ppl
TABITHA|Also called Dorcas|nt,ppl
EDEN|First garden|plc
BABEL|Tower city|plc
SODOM|Destroyed with Gomorrah|plc
GOMORRAH|Sodom's twin city|plc
HARAN|Abraham's stop in Mesopotamia|plc
CANAAN|Promised Land|plc
EGYPT|Land of the Pharaohs|plc
SINAI|Mountain of the law|plc
HOREB|Mountain of God|plc
JORDAN|River of baptism|plc
JERICHO|City of fallen walls|plc
ZION|Holy hill|plc,psalm
BETHEL|House of God|plc
BETHLEHEM|Birthplace of Jesus|plc,xmas
NAZARETH|Jesus' hometown|plc,xmas
GALILEE|Sea Jesus walked on|plc
JERUSALEM|The holy city|plc,pent,east
JUDEA|Roman province|plc
SAMARIA|Region of the Samaritans|plc
CANA|Water into wine|plc
CAPERNAUM|Jesus' base in Galilee|plc
BETHANY|Lazarus' village|plc
EMMAUS|Road of a risen encounter|plc,east
GOLGOTHA|Place of the Skull|plc,east
CALVARY|Where Jesus was crucified|plc,east
TARSUS|Paul's hometown|plc
DAMASCUS|Paul's road to here|plc
ANTIOCH|Believers first called Christians here|plc
CORINTH|Greek city with two letters from Paul|plc
EPHESUS|City of Paul's letter on armor|plc
PHILIPPI|Where Paul and Silas sang in jail|plc
ROME|Paul's final destination|plc
PATMOS|John's island exile|plc
CRETE|Island where Titus served|plc
BABYLON|Land of Daniel's exile|plc
NINEVEH|City Jonah warned|plc
MORIAH|Abraham's mountain test|plc
CARMEL|Elijah's mountain contest|plc
ARARAT|Where the ark rested|plc
NEBO|Where Moses viewed the land|plc
SHILOH|Early home of the tabernacle|plc
HEBRON|Abraham's burial city|plc
GOSHEN|Israel's land in Egypt|plc
MOAB|Ruth's homeland|plc
EDOM|Esau's land|plc
SHEBA|Queen who visited Solomon|plc
OLIVES|Mount of __|plc,east
GENESIS|First book|bk
EXODUS|Second book|bk
LEVITICUS|Book of priestly laws|bk
NUMBERS|Wilderness census book|bk
JUDGES|Book after Joshua|bk
KINGS|Two books after Samuel|bk
PSALMS|Book of songs|bk,psalm
PROVERBS|Book of wise sayings|bk
ACTS|Book after John|bk,pent
ROMANS|Paul's letter to Rome|bk
GALATIANS|Paul's letter on freedom|bk
EPHESIANS|Armor of God appears here|bk
HEBREWS|Hall of Faith book|bk
JUDE|Brother of James|bk
PHILEMON|Letter about Onesimus|bk
FAITH|Belief in the unseen|thm
FAITH|Hope and love partner|thm
HOPE|Anchor of the soul|thm
LOVE|Greatest of these|thm
LOVED|For God so __ the world|thm
GRACE|Unmerited favor|thm
MERCY|God's compassion|thm,psalm
PEACE|Fruit of the Spirit|thm,xmas
JOY|Fruit of the Spirit|thm,xmas,psalm
PRAYER|Talking with God|thm
PRAISE|Hallelujah!|thm,psalm
WORSHIP|Adoration of God|thm
AMEN|So be it|thm
HOSANNA|Palm Sunday shout|thm,east
SAVIOR|One who rescues|thm,xmas
MESSIAH|The Anointed One|thm,xmas
CHRIST|Anointed One|thm,east
LORD|Master|thm
SHEPHERD|The Lord is my __|thm,psalm
LAMB|Sacrificial animal|thm,east
LION|Judah's emblem|thm
ROCK|Peter means this|thm,psalm
VINE|I am the true __|thm
LIGHT|Let there be __|thm,xmas
BREAD|Give us this day our daily __|thm,east
TRUTH|The way, the __, the life|thm
GOSPEL|Good news|thm
BIBLE|Holy book|thm
SCRIPTURE|God-breathed writing|thm
PARABLE|Story Jesus told|thm
MIRACLE|Wonder of God|thm
COVENANT|Sacred agreement|thm
TEMPLE|Solomon built it|thm
ALTAR|Place of sacrifice|thm
ARK|Noah's vessel|thm
MANNA|Bread from heaven|thm
QUAIL|Birds that fed Israel|thm
SABBATH|Day of rest|thm
TITHE|A tenth given to God|thm
OFFERING|Gift in worship|thm
PRIEST|Temple minister|thm
PROPHET|God's spokesman|thm
ANGEL|Heavenly messenger|thm,xmas
HEAVEN|God's dwelling|thm
SPIRIT|Holy __|thm,pent
TRINITY|Father, Son, Holy Spirit|thm
BAPTISM|Immersion in water|thm,pent
COMMUNION|Lord's Supper|thm
FASTING|Going without food to pray|thm
REPENT|Turn from sin|thm
FORGIVE|Pardon|thm
BLESSED|Beatitudes opener|thm
ANOINTED|Set apart with oil|thm
DISCIPLE|Follower of Jesus|thm,pent
APOSTLE|One sent out|thm
MISSION|Sent to spread the gospel|thm
CHURCH|Body of Christ|thm
PASTOR|Church shepherd|thm
DEACON|Church servant|thm
ELDER|Church leader|thm
BISHOP|Overseer|thm
CHOIR|Singing group at church|thm
HYMN|Church song|thm
PSALM|Song of David|thm,psalm
SERMON|Message from the pulpit|thm
CROSS|Where Jesus died|thm,east
THORNS|Pierced Jesus' brow|east
NAILS|Fastened Him to the cross|east
TOMB|Empty on Easter|east
STONE|Rolled away from the tomb|east
RISEN|He is __!|east
EASTER|Resurrection Sunday|east
LENT|40 days before Easter|east
PALM|Waved on Palm Sunday|east
LINEN|Burial cloth|east
SPICES|Women brought them to the tomb|east
VEIL|Temple curtain that tore|east
PASSOVER|Exodus feast|east
DONKEY|Animal Jesus rode|east
SUNDAY|Day He rose|east
ADVENT|Season before Christmas|xmas
STAR|Guided the Magi|xmas
MANGER|Baby's bed|xmas
INN|No room at the __|xmas
GIFT|Gold, frankincense, myrrh|xmas
GOLD|Magi's first gift|xmas
MYRRH|Burial spice gift|xmas
MAGI|Wise men|xmas
EMMANUEL|God with us|xmas
NATIVITY|Birth scene|xmas
CAROL|Christmas song|xmas
SHEPHERDS|Watched flocks by night|xmas
BELL|Rings in church|xmas
CANDLE|Lit on Advent wreaths|xmas
FLAME|Tongue of fire|pent
FIRE|Rested on each believer|pent
TONGUES|Spoken in Acts 2|pent
WIND|Rushing sound at Pentecost|pent
PENTECOST|Fiftieth day|pent
COMFORTER|Another name for the Spirit|pent
GIFTS|Spiritual __|pent
FRUIT|Love, joy, peace...|pent
POWER|Received when the Spirit comes|pent
WITNESS|Testify of Jesus|pent
BOLD|Fearless like Peter|pent
HOLY|__, holy, holy|thm,pent
ARMOR|Put on the whole __ of God|thm
SHIELD|Faith is the __|thm
HELMET|Of salvation|thm
SWORD|Word of God is a __|thm
RAINBOW|Sign of Noah's covenant|thm
FLOOD|Covered the earth|thm
DOVE|Noah's bird|thm
OLIVE|Branch the dove brought|thm
LOCUST|Plague insect|thm
PLAGUE|Struck Egypt|thm
JUBILEE|Year of release|thm
TRUMPET|Fell Jericho's walls|thm
SLING|David's weapon|thm
GIANT|Goliath, for one|thm
FURNACE|Fiery __|thm
NET|Fisherman's tool|thm
BOAT|Peter's fishing __|thm
WELL|Jacob's __ in Samaria|thm
CAMEL|Needle's eye animal|thm
SERPENT|Tempted Eve|thm
FIG|Leaf for Adam and Eve|thm
GRAPES|Spies carried a cluster|thm
MUSTARD|Tiny faith seed|thm
YEAST|Kingdom likened to __|thm
PEARL|Great price parable|thm
TALENT|Servant's coin in a parable|thm
COIN|Lost one found|thm
SEED|Sower scatters it|thm
SOWER|Parable farmer|thm
HARVEST|Plentiful, laborers few|thm
WHEAT|Separated from the tares|thm
CHAFF|What the wind blows away|psalm
SALT|You are the __ of the earth|thm
LAMP|Thy word is a __ to my feet|thm
EARTH|In the beginning God made heaven and __|thm
REFUGE|God is our __ and strength|psalm
FORTRESS|The Lord is my rock and __|psalm
PASTURES|Green __|psalm
VALLEY|Dark one in Psalm 23|psalm
SHADOW|Valley of the __ of death|psalm
GOODNESS|__ and mercy shall follow me|psalm
HARP|David's instrument|psalm
CYMBALS|Loud praise instruments|psalm
SELAH|Pause and reflect|psalm
SONG|New __ unto the Lord|psalm
CUP|My __ runneth over|psalm
TRUST|__ in the Lord with all your heart|psalm
STILL|Be __ and know|psalm
HONEY|Land of milk and __|thm
MILK|Land flowing with __ and honey|thm
LION||obj|🦁
DOVE||obj|🕊️
FISH||obj|🐟
STAR||obj,xmas|⭐
CROSS||obj,east|✝️
CROWN||obj|👑
BREAD||obj|🍞
SHEEP||obj,psalm|🐑
WHEAT||obj|🌾
GRAPES||obj|🍇
OLIVE||obj|🫒
LAMP||obj|🪔
BOAT||obj|⛵
BIBLE||obj|📖
CHURCH||obj|⛪
BELL||obj,xmas|🔔
SERPENT||obj|🐍
CAMEL||obj|🐪
ROOSTER||obj,east|🐓
WATER||obj|💧
FIRE||obj,pent|🔥
SWORD||obj|⚔️
SHIELD||obj|🛡️
KEY||obj|🔑
ANCHOR||obj|⚓
HEART||obj|❤️
PRAYER||obj|🙏
SUN||obj|☀️
MOON||obj|🌙
MOUNTAIN||obj|⛰️
WIND||obj,pent|💨
CLOUD||obj|☁️
CANDLE||obj,xmas|🕯️
WINE||obj|🍷
SCROLL||obj|📜
TENT||obj|⛺
TREE||obj|🌳
ROSE||obj|🌹
GIFT||obj,xmas|🎁
TRUMPET||obj,psalm|🎺
PIANO||obj|🎹
HONEY||obj|🍯
MILK||obj|🥛
SEED||obj|🌱
PALM||obj,east|🌴
HAM|One of Noah's three sons|ot|
LOT|Abraham's nephew who fled Sodom|ot|
BALAAM|Prophet whose donkey spoke|ot|
OBED|Son of Ruth and Boaz|ot|
JESSE|Father of King David|ot,xmas|
JOAB|David's army commander|ot|
MALACHI|Last prophet of the Old Testament|ot|
DARIUS|King who threw Daniel to the lions|ot|
PHARAOH|Ruler of Egypt in Moses' day|ot|
ENOS|Son of Seth|ot|
MALTA|Island where Paul was shipwrecked|plc,nt|
ISRAEL|Name God gave to Jacob|plc,ot|
SIN|Missing the mark|thm|
ABBA|Aramaic word for "Father"|thm,nt|
OMEGA|Last letter of the Greek alphabet|thm|
TORAH|The first five books of the Bible|thm,bk|
CHERUB|Winged guardian of Eden|thm,ot|
SATAN|The accuser, enemy of God|thm|
DEVIL|Tempted Jesus in the wilderness|thm|
HELL|Place of separation from God|thm|
REDEEM|Buy back, set free|thm|
WORD|"In the beginning was the ___"|thm|
GLORY|"___ to God in the highest"|thm,xmas|
THANKS|Give ___ in all circumstances|thm|
BLESS|Ask God's favor on|thm|
SAVED|Rescued by grace through faith|thm|
BORN|"You must be ___ again"|thm|
GOOD|"I am the ___ shepherd"|thm|
GOD|Creator of heaven and earth|thm|
SON|Jesus is God's one and only ___|thm,xmas|
KING|Jesus, ___ of kings|thm,xmas|
FATHER|"Our ___ in heaven"|thm|
OIL|Poured on kings and priests|thm,ot|
ASK|"___ and it will be given to you"|thm|
SEEK|"___ and you will find"|thm|
KNOCK|"___ and the door will be opened"|thm|
REAP|"You ___ what you sow"|thm|
ROD|Moses' shepherd staff|thm,ot|
RED|Color of the sea Moses parted|thm,ot|
SEA|Parted for Israel|thm,ot|
RAIN|Fell for forty days on Noah's ark|thm,ot|
DEW|Wet Gideon's fleece|thm,ot|
WOOL|Material of Gideon's fleece|thm,ot|
TEN|Number of commandments|thm,ot|
ONE|"The Lord is ___"|thm|
TWO|Number of each animal on the ark|thm,ot|
THREE|Days Jesus spent in the tomb|thm,east|
FIVE|Loaves Jesus multiplied|thm,nt|
TWELVE|Disciples, tribes of Israel|thm|
BOOK|The Bible is the Good ___|thm|
HEN|Gathers her chicks under her wings|thm,nt|
SNAKE|Tempter in Eden|thm,ot|
WOLF|Dresses in sheep's clothing|thm,nt|
BULL|Animal sacrificed at the altar|thm,ot|
EGG|Easter symbol of new life|thm,east|
GRAPE|Fruit of the vine|thm|
SHIP|Vessel that carried Paul to Rome|thm,nt|
DOOR|"I am the ___," said Jesus|thm,nt|
PRAY|Talk with God|thm|
SPEAR|Pierced Jesus' side|thm,east|
SILVER|Thirty pieces of ___|thm,east|
DENIED|Peter ___ knowing Jesus|thm,east|
FRIDAY|Good ___|thm,east|
LILY|Flower of Easter|thm,east|
NOEL|Christmas, in French|thm,xmas|
WISE|___ men from the East|thm,xmas|
NIGHT|"Silent ___"|cur,xmas|
WORLD|"Joy to the ___"|cur,xmas|
FAITHFUL|"O come, all ye ___"|cur,xmas|
TUTU|Archbishop Desmond ___|cur|
TERESA|Mother ___ of Calcutta|cur|
HANDEL|Composer of "Messiah"|cur,xmas|
SYNOD|Church council|cur|
CONCLAVE|Meeting that elects a pope|cur|
CREED|Statement of belief|cur|
AMAZING|"___ Grace, how sweet the sound"|cur|
ART|"How Great Thou ___"|cur|
AGES|"Rock of ___"|cur|
VISION|"Be Thou My ___"|cur|
RCCG|Redeemed Christian Church of God|cur
ADEBOYE|Pastor Enoch __ of RCCG|cur,ppl
OYEDEPO|Bishop David __, Winners' Chapel|cur,ppl
KUMUYI|Deeper Life founder W. F. __|cur,ppl
OLUKOYA|MFM founder D. K. __|cur,ppl
WINNERS|__ Chapel, Nigerian megachurch|cur
DUNAMIS|Abuja church of Paul Enenche|cur
HILLSONG|Australian church known for worship|cur
LAKEWOOD|Joel Osteen's Houston church|cur
VATICAN|Home of the Pope|cur
POPE|Leader of the Catholic Church|cur
LEO|Pope __ XIV, elected 2025|cur
FRANCIS|Pope who died in 2025|cur
GRAHAM|Evangelist Billy __|cur,ppl
WARREN|Rick __, Purpose Driven Life|cur,ppl
LUCADO|Author Max __|cur,ppl
MEYER|Bible teacher Joyce __|cur,ppl
JAKES|Bishop T. D. __|cur,ppl
OSTEEN|Pastor Joel __|cur,ppl
LEWIS|C. S. __, Narnia author|cur,ppl
TOMLIN|Worship leader Chris __|cur,ppl
SINACH|Singer of Way Maker|cur,ppl
WAYMAKER|Miracle worker, promise keeper|cur
BASSEY|Gospel singer Nathaniel __|cur,ppl
FRANKLIN|Gospel artist Kirk __|cur,ppl
MOEN|Worship singer Don __|cur,ppl
DAIGLE|Singer Lauren __|cur,ppl
COBBS|Gospel singer Tasha __|cur,ppl
ELEVATION|Charlotte church and worship band|cur
MERCYME|Band behind I Can Only Imagine|cur
OCEANS|Hillsong song: __ (Where Feet May Fail)|cur
CHOSEN|TV series about Jesus' followers|cur
BAPTIST|Believer's baptism church|cur
METHODIST|Church of the Wesley family|cur
ANGLICAN|Church of England family|cur
CATHOLIC|Church led by the Pope|cur
ORTHODOX|Eastern church tradition|cur
LUTHERAN|Denomination named for a reformer|cur
COPTIC|Egypt's Christian church|cur
QUAKER|Society of Friends member|cur
MENNONITE|Anabaptist denomination|cur
ARMY|Salvation __|cur
LAUSANNE|Global evangelism congress|cur
ALPHA|Course exploring Christianity|cur
GIDEONS|Bibles-in-hotels group|cur
`;

export const EVENT_TAGS = ['xmas', 'east', 'pent', 'hero', 'psalm'];

export function parseBank(raw = RAW) {
  const out = [];
  raw.split('\n').forEach((line) => {
    line = line.trim();
    if (!line) return;
    const [a, c = '', tags = '', e = ''] = line.split('|');
    if (!/^[A-Z]{3,9}$/.test(a)) { console.warn('bad answer', a); return; }
    out.push({ id: out.length, a, c, e, tags: tags.split(',').filter(Boolean) });
  });
  return out;
}

export const BANK = parseBank();
