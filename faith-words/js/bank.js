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
ASA|Good king of Judah|ot,ppl
ABA|Aramaic word for father|nt,thm
ARM|Strong __ of the Lord|thm
AIR|Prince of the power of the __|nt,thm
AGE|Ancient of days has no __|thm
AWE|Reverent wonder|thm
BED|Lame man took up his __|nt,obj
BUD|Aaron's rod did this|ot,obj
CAN|I __ do all things through Christ|nt,thm
DAN|Tribe of Samson|ot,ppl
DAY|Seventh __ of rest|ot,thm
EAR|He who has an __ let him hear|nt,thm
EAT|Take, __ this is my body|nt,thm
EYE|Lamp of the body|nt,obj
FAR|Prodigal went to a __ country|nt,thm
FEW|Laborers are __|nt,thm
FOE|Love your __|nt,thm
GAD|Jacob's seventh son|ot,ppl
HIM|Worship __ in spirit|thm
HOE|Farm tool of old|obj
ICE|Job's waters were hid as with __|ot,obj
ILL|Opposite of well|thm
IRA|One of David's mighty men|ot,ppl
LAW|Moses gave the __|ot,thm
LIE|Satan is the father of it|nt,thm
MAN|Created in God's image|thm
NOD|Land east of Eden|ot,plc
NUN|Joshua's father|ot,ppl
OWN|Ye are not your __|nt,thm
PEN|Writer's tool|obj
PIT|Joseph was thrown in one|ot,obj
RAM|Caught in the thicket|ot,obj
RAT|Unclean animal|ot,obj
SOW|Plant seed|thm
TAX|Caesar's due|nt,thm
TIN|Metal in Moses' time|ot,obj
URN|Vessel for manna|ot,obj
VOW|Hannah made one|ot,thm
WAY|I am the __, the truth, the life|nt,thm
WEB|Spider's trap|obj
WOE|Cry of the prophets|ot,thm
YEA|Let your __ be yea|nt,thm
ZOAR|City Lot fled to|ot,plc
AARON|Moses' brother|ot,ppl
ABRAM|Abraham's first name|ot,ppl
ANGEL|Messenger from heaven|thm
APOSTLE|Sent one|nt,thm
ASHER|Jacob's eighth son|ot,ppl
BREAD|Daily need in the prayer|nt,obj
BIBLE|Holy Scripture|thm
CROWN|Of thorns|nt,obj,east
DRESS|Wedding garment|obj
EARTH|Meek shall inherit it|nt,thm
FAITH|Substance of things hoped for|thm
HEART|Seat of the affections|thm
IDOL|False god|ot,obj
JAMES|Brother of John|nt,ppl
JUDAH|Lion's tribe|ot,ppl
LIGHT|World's __ in Christ|nt,thm,xmas
MERCY|Blessed are the merciful, they obtain __|nt,thm
OLIVE|Dove brought a branch|ot,obj
PEACE|Prince of __|thm,xmas
PRAISE|Lift up in worship|thm,psalm
SAINT|Holy one|thm
SHEEP|Good Shepherd's flock|nt,obj
TEMPLE|House of the Lord|thm
TITUS|Letter to Paul's helper|nt,bk
TRUTH|Sets you free|nt,thm
TRUST|Lean not on own understanding|thm
ROMANS|Epistle after Acts|bk,nt
LOAF|Five barley ones fed thousands|nt,obj
ORE|Metal bearing rock|obj
ABEL|Shepherd killed by his brother|ot,ppl
ABIJAH|King of Judah, son of Rehoboam|ot,ppl
ACHAN|Hid forbidden spoils at Jericho|ot,ppl
ADAH|Wife of Lamech|ot,ppl
AGABUS|Prophet who foretold a famine|nt,ppl
AGAG|King spared by Saul|ot,ppl
AHAZ|Wicked king of Judah|ot,ppl
AMOZ|Father of Isaiah|ot,ppl
AMRAM|Father of Moses|ot,ppl
ANANIAS|Lied about the price of land|nt,ppl
ANNAS|High priest at Jesus' trial|nt,ppl
ARAM|Syria in the Old Testament|ot,plc
ASAPH|Psalm-writing temple musician|ot,ppl,psalm
ATHALIAH|Queen who seized Judah's throne|ot,ppl
AZARIAH|Hebrew name of Abednego|ot,ppl,hero
BAAL|False god of Elijah's contest|ot,thm
BAASHA|King who killed Nadab|ot,ppl
BALAK|King who hired Balaam|ot,ppl
BARAK|Judge Deborah's general|ot,ppl,hero
BATHSHEBA|Mother of Solomon|ot,ppl
BERNICE|Sister of Agrippa|nt,ppl
BETHUEL|Rebekah's father|ot,ppl
BEZALEEL|Craftsman of the tabernacle|ot,ppl
BILHAH|Rachel's maid|ot,ppl
BOANERGES|Sons of thunder|nt,ppl
CANDACE|Queen of the Ethiopians|nt,ppl
CLAUDIUS|Caesar who expelled the Jews|nt,ppl
CRISPUS|Synagogue ruler in Corinth|nt,ppl
CYRUS|Persian king who freed the exiles|ot,ppl
DARIUS|King who threw Daniel in the den|ot,ppl,hero
DEMAS|Paul's helper who loved the world|nt,ppl
DINAH|Daughter of Jacob and Leah|ot,ppl
DORCAS|Raised by Peter at Joppa|nt,ppl,hero
EBED|Father of Gaal|ot,ppl
EGLON|Fat Moabite king slain by Ehud|ot,ppl
EHUD|Left-handed judge|ot,ppl,hero
ELAH|Valley where David fought Goliath|ot,plc
ELEAZAR|Aaron's son and priest|ot,ppl
ELIAB|David's eldest brother|ot,ppl
ELIPHAZ|First friend of Job to speak|ot,ppl
ELKANAH|Father of Samuel|ot,ppl
ENOCH|Walked with God and was not|ot,ppl,hero
EPAPHRAS|Colossian minister|nt,ppl
ERASTUS|City treasurer of Corinth|nt,ppl
EUNICE|Timothy's mother|nt,ppl
EUODIA|Philippian woman who needed peace|nt,ppl
EZEKIEL|Prophet of the dry bones|ot,ppl,hero
FELIX|Governor who trembled at Paul|nt,ppl
FESTUS|Governor who succeeded Felix|nt,ppl
GAIUS|Paul's host and friend|nt,ppl
GAMALIEL|Pharisee who taught Paul|nt,ppl
GEHAZI|Elisha's greedy servant|ot,ppl
GERSHOM|Moses' firstborn son|ot,ppl
HADASSAH|Esther's Hebrew name|ot,ppl
HAGGAI|Prophet who urged rebuilding|ot,ppl
HANANIAH|False prophet who broke a yoke|ot,ppl
HEBER|Husband of Jael|ot,ppl
HEZEKIAH|King who prayed and was healed|ot,ppl,hero
HIRAM|King of Tyre who aided Solomon|ot,ppl
HOPHNI|Wicked son of Eli|ot,ppl
HULDAH|Prophetess in Josiah's day|ot,ppl
HUR|Held up Moses' hands|ot,ppl
JAEL|Woman who defeated Sisera|ot,ppl,hero
JAIRUS|Synagogue ruler whose daughter lived|nt,ppl
JEHU|Furious charioteer king|ot,ppl
JEPHTHAH|Judge with a rash vow|ot,ppl
JETHRO|Moses' father-in-law|ot,ppl
JOASH|Boy king hidden in the temple|ot,ppl
JOCHEBED|Mother of Moses|ot,ppl
JONADAB|Rechabite friend of Jehu|ot,ppl
JOSIAH|Boy king who found the law book|ot,ppl,hero
JOTHAM|Told a parable about trees|ot,ppl
JUDITH|Esau's Hittite wife|ot,ppl
KEZIA|Second daughter of Job|ot,ppl
KORAH|Rebelled against Moses|ot,ppl
LAMECH|Father of Noah|ot,ppl
LOIS|Timothy's grandmother|nt,ppl
LUKE|Beloved physician|nt,ppl
MALCHUS|Servant whose ear Peter cut|nt,ppl
MANASSEH|Joseph's firstborn son|ot,ppl
MATTHIAS|Chosen to replace Judas|nt,ppl
MICAH|Prophet from Moresheth|ot,ppl
MICHAL|David's first wife|ot,ppl
MIRIAM|Sister who led the timbrel song|ot,ppl
NABAL|Foolish husband of Abigail|ot,ppl
NABOTH|Owner of a coveted vineyard|ot,ppl
NADAB|Son of Aaron who offered strange fire|ot,ppl
NAHUM|Prophet of Nineveh's fall|ot,ppl
NATHAN|Prophet who confronted David|ot,ppl
NATHANAEL|Under the fig tree|nt,ppl
NIMROD|Mighty hunter before the Lord|ot,ppl
OBADIAH|Shortest Old Testament book|ot,ppl,bk
ONESIMUS|Runaway slave Paul pleaded for|nt,ppl
ORPAH|Naomi's other daughter-in-law|ot,ppl
OTHNIEL|First judge of Israel|ot,ppl
PHARAOH|Ruler of Egypt|ot,ppl
PHEBE|Deaconess of Cenchrea|nt,ppl
PHINEHAS|Zealous priest, grandson of Aaron|ot,ppl
PUBLIUS|Chief man of Malta|nt,ppl
RAHAB|Harlot who hid the spies|ot,ppl,hero
REHOBOAM|Solomon's foolish son|ot,ppl
RHODA|Girl who left Peter at the gate|nt,ppl
SAPPHIRA|Wife of Ananias|nt,ppl
SERGIUS|Proconsul of Cyprus|nt,ppl
SHEM|Eldest son of Noah|ot,ppl
SHIMEI|Man who cursed David|ot,ppl
SIHON|Amorite king defeated by Israel|ot,ppl
SISERA|Canaanite commander|ot,ppl
STEPHANAS|First convert in Achaia|nt,ppl
SUSANNA|Woman who served Jesus|nt,ppl
SYNTYCHE|Philippian woman with Euodia|nt,ppl
TAMAR|Daughter-in-law of Judah|ot,ppl
TERAH|Father of Abraham|ot,ppl
TERTULLUS|Lawyer against Paul|nt,ppl
TIMOTHY|Young pastor at Ephesus|nt,ppl
TITUS|Paul's helper in Crete|nt,ppl
TOBIAH|Enemy of Nehemiah|ot,ppl
TRYPHENA|Woman who worked in the Lord|nt,ppl
TYCHICUS|Faithful minister and mail carrier|nt,ppl
URIAH|Husband of Bathsheba|ot,ppl
UZZIAH|King struck with leprosy|ot,ppl
VASHTI|Queen who refused the king|ot,ppl
ZADOK|Priest who anointed Solomon|ot,ppl
ZEBEDEE|Father of James and John|nt,ppl
ZEBULUN|Tenth son of Jacob|ot,ppl
ZECHARIAH|Father of John the Baptist|nt,ppl,xmas
ZEDEKIAH|Last king of Judah|ot,ppl
ZEPHANIAH|Prophet of the day of the Lord|ot,ppl
ZILPAH|Leah's maid|ot,ppl
ZIPPORAH|Wife of Moses|ot,ppl
ZOPHAR|Third friend of Job|ot,ppl
ANDREW|Brother of Simon Peter|nt,ppl
JAMES|Brother of the Lord|nt,ppl
JOSEPH|Husband of Mary|nt,ppl,xmas
ELIZABETH|Mother of John the Baptist|nt,ppl,xmas
SIMEON|Held the baby Jesus in the temple|nt,ppl,xmas
ANNA|Prophetess who saw the child Jesus|nt,ppl,xmas
HEROD|King who feared the newborn king|nt,ppl,xmas
CAESAR|Emperor who ordered the census|nt,ppl,xmas
GABRIEL|Angel who spoke to Mary|nt,ppl,xmas
MAGI|Wise men from the East|nt,ppl,xmas
NICODEMUS|Came to Jesus by night|nt,ppl,east
JOSEPH|Man who gave his tomb for Jesus|nt,ppl,east
CLEOPAS|Walked the road to Emmaus|nt,ppl,east
BARABBAS|Prisoner released instead of Jesus|nt,ppl,east
SIMON|Carried the cross of Jesus|nt,ppl,east
MAGDALENE|Mary who met Jesus at the tomb|nt,ppl,east
CAIAPHAS|High priest who judged Jesus|nt,ppl,east
CENTURION|Roman who said truly this was the Son|nt,ppl,east
ACHAIA|Roman province of Corinth|nt,plc
ARARAT|Mountains where the ark rested|ot,plc
ASIA|Province of the seven churches|nt,plc
ATHENS|City of the Areopagus|nt,plc
BABEL|Tower that scattered the nations|ot,plc
BASHAN|Land of strong bulls|ot,plc
BEERSHEBA|Southern well city of Abraham|ot,plc
BETHANY|Village of Mary, Martha and Lazarus|nt,plc
BETHEL|House of God where Jacob dreamed|ot,plc
BETHESDA|Pool where a lame man was healed|nt,plc
CANA|Water became wine here|nt,plc
CARMEL|Mountain of Elijah's contest|ot,plc
CHALDEA|Home land of Abraham's family|ot,plc
CORINTH|City of Paul's two letters|nt,plc
CYPRUS|Island home of Barnabas|nt,plc
DAN|Northern city of Israel|ot,plc
DERBE|City visited by Paul and Barnabas|nt,plc
DOTHAN|Where Joseph found his brothers|ot,plc
EBAL|Mount of the curse|ot,plc
EGYPT|Land of the Exodus|ot,plc
ELAM|Land east of Babylon|ot,plc
EMMAUS|Village on the road of Easter evening|nt,plc,east
EPHESUS|City with the temple of Diana|nt,plc
ETHIOPIA|Land of the eunuch Philip met|nt,plc
EUPHRATES|River of Babylon|ot,plc
GALATIA|Region of Paul's angry letter|nt,plc
GALILEE|Sea where Jesus walked on water|nt,plc
GATH|Goliath's hometown|ot,plc
GAZA|Samson's last city|ot,plc
GERAR|City where Isaac dug wells|ot,plc
GILEAD|Land famous for its balm|ot,plc
GILGAL|Israel's first camp in Canaan|ot,plc
GOLGOTHA|Place of a skull|nt,plc,east
GOSHEN|Egyptian land of Israel's settlement|ot,plc
HEBRON|City of the patriarchs' tombs|ot,plc
HERMON|Snow-capped northern mount|ot,plc
IRAQ|Land of ancient Babylon today|cur,plc
JERICHO|Walls fell flat|ot,plc,hero
JOPPA|Port where Peter saw a sheet|nt,plc
JORDAN|River of Jesus' baptism|nt,plc
JUDEA|Province of Bethlehem|nt,plc
KADESH|Wilderness camp of Israel|ot,plc
KIDRON|Brook crossed by Jesus and David|nt,plc
LACHISH|Fortified city of Judah|ot,plc
LEBANON|Land of mighty cedars|ot,plc
LYSTRA|Where Paul was stoned|nt,plc
MAMRE|Oaks where Abraham pitched tents|ot,plc
MEGIDDO|Plain of Armageddon|ot,plc
MIDIAN|Land where Moses fled|ot,plc
MORIAH|Mountain where Isaac was offered|ot,plc
NAIN|Town where a widow's son was raised|nt,plc
NAZARETH|Home town of Jesus|nt,plc,xmas
NEBO|Mount where Moses died|ot,plc
NILE|River of the baby in the basket|ot,plc
NINEVEH|City that repented at Jonah's word|ot,plc
OLIVET|Mount of the Ascension|nt,plc
PATMOS|Island of John's revelation|nt,plc
PERGA|Port in Pamphylia|nt,plc
PERSIA|Empire of Esther's day|ot,plc
PHILIPPI|City of the jailer and Lydia|nt,plc
RAMAH|Home of Samuel|ot,plc
SALEM|City of Melchizedek|ot,plc
SAMARIA|Home of the good neighbor|nt,plc
SARDIS|Church that had a name of being alive|nt,plc
SHECHEM|Place of Jacob's well|ot,plc
SHILOH|Home of the tabernacle|ot,plc
SIDON|Phoenician port city|ot,plc
SINAI|Mountain of the Ten Commandments|ot,plc
SMYRNA|Faithful church of the crown of life|nt,plc
SODOM|City of Lot's escape|ot,plc
SYRIA|Land of Naaman|ot,plc
TARSUS|Paul's home city|nt,plc
THEBES|Egyptian city named in Nahum|ot,plc
TYRE|Phoenician port ruled by Hiram|ot,plc
UR|City of the Chaldeans|ot,plc
ZION|The city of David|ot,plc
ZOAR|Little town Lot asked for|ot,plc
ACTS|History of the early church|bk,nt
AMOS|Herdsman prophet|bk,ot
DANIEL|Book with the lions' den|bk,ot
ESTHER|Book without the name of God|bk,ot
EXODUS|Book of the Red Sea|bk,ot
EZRA|Book of the returning exiles|bk,ot
HOSEA|Book of the unfaithful wife|bk,ot
ISAIAH|Longest prophetic book|bk,ot
JAMES|Epistle of faith and works|bk,nt
JEREMIAH|Weeping prophet's book|bk,ot
JOB|Book of the patient sufferer|bk,ot
JOEL|Book of the locust plague|bk,ot
JOHN|Gospel of the Word|bk,nt
JONAH|Book of the big fish|bk,ot
JOSHUA|Book of the conquest|bk,ot
JUDE|Short letter on contending for faith|bk,nt
JUDGES|Book of Gideon and Samson|bk,ot
LUKE|Gospel of the good Samaritan|bk,nt
MALACHI|Last book of the Old Testament|bk,ot
MARK|Shortest Gospel|bk,nt
MATTHEW|First book of the New Testament|bk,nt
MICAH|Book that mentions Bethlehem Ephratah|bk,ot,xmas
NAHUM|Book against Nineveh|bk,ot
NUMBERS|Book of the census|bk,ot
PROVERBS|Book of wisdom sayings|bk,ot
PSALMS|Hymnbook of the Bible|bk,ot,psalm
ROMANS|Epistle of justification by faith|bk,nt
RUTH|Book of the Moabite gleaner|bk,ot
TITUS|Pastoral letter to Crete|bk,nt
ZECHARIAH|Book of the humble king on a donkey|bk,ot
GENESIS|Book of beginnings|bk,ot
LEVITICUS|Book of priests and offerings|bk,ot
HEBREWS|Letter on the better covenant|bk,nt
PETER|Two letters of this fisherman|bk,nt
SONG|Of Solomon|bk,ot
EPHESIANS|Letter of the armor of God|bk,nt
GALATIANS|Letter on the fruit of the Spirit|bk,nt
SAMUEL|Books of Saul and David|bk,ot
ABIDE|Remain in me and I in you|nt,thm
ABOVE|Seek things that are __|nt,thm
ADORE|Worship with deep love|thm
AFRAID|Fear not, be not __|thm
AGAPE|Greek word for selfless love|nt,thm
ALIVE|Christ is risen and __|east,thm
ALMS|Gifts to the poor|thm
ALOE|Spice used with myrrh at the tomb|nt,obj,east
ALONE|Man should not be __ in Eden|ot,thm
ANGER|Be slow to __|thm
ARISE|Shine, for your light has come|thm
ARROW|Jonathan shot one beyond the lad|ot,obj
ASHES|Dust and __|ot,thm
ASLEEP|Disciples in the garden were __|nt,east
ASS|Beast Balaam rode|ot,obj
ATONE|Make amends for sin|thm
AXE|Iron one that floated for Elisha|ot,obj
BACK|Plow and never look __|nt,thm
BAND|Roman soldiers in the garden|nt,east
BANNER|Jehovah-nissi is the Lord my __|ot,obj
BARLEY|Grain of the boy's lunch|nt,obj
BARN|Where the rich fool stored crops|nt,obj
BASIN|Jesus washed feet with one|nt,obj,east
BATTLE|The __ is the Lord's|ot,thm
BEAM|Plank in your own eye|nt,obj
BEAST|Creature of Revelation's visions|nt,thm
BEE|Insect of Samson's riddle|ot,obj
BEGAT|Word repeated in genealogies|ot,thm
BELIEVE|Faith to __ in the Lord|thm
BELOVED|Dearly loved|thm
BIRD|Sparrow or dove|obj
BIRTH|The nativity|nt,thm,xmas
BLESS|Ask God to favor|thm
BLIND|Bartimaeus could not see|nt,thm
BLOOD|Lamb's __ on the doorposts|ot,thm,east
BLOWN|Shofar horn __ at Jericho|ot,thm
BOAT|Peter's fishing craft|nt,obj
BODY|Church is the __ of Christ|nt,thm
BONES|Valley of dry __|ot,obj
BOOT|Soldier's footwear|obj
BOW|Rainbow, in a sense|ot,obj
BOWL|Vial of wrath|nt,obj
BRANCH|Vine and __|nt,obj
BREAK|Bread to __ at communion|nt,thm
BREATH|God gave Adam the __ of life|ot,thm
BRIDE|Church as the Lamb's wife|nt,thm
BROOK|Cherith or Kidron|ot,obj
BROTHER|Cain's Abel|ot,thm
BURN|Bush did not __ up|ot,thm
BUSH|Burning one in Midian|ot,obj
CAIN|First son of Adam|ot,ppl
CAKE|Elijah's meal in the wilderness|ot,obj
CALL|God's __ to Samuel|ot,thm
CALF|Golden one at Sinai|ot,obj
CARE|Cast all your __ on him|nt,thm
CAVE|Hideout of David and Elijah|ot,obj
CEDAR|Tree of Lebanon|ot,obj
CHAIN|Paul wore one in prison|nt,obj
CHAFF|Wicked are like this|ot,obj
CHARIOT|Elijah's ride to heaven|ot,obj
CHEEK|Turn the other __|nt,thm
CHILD|Unto us a __ is born|ot,thm,xmas
CHOSEN|People __ by God|thm
CLAY|Potter's material|ot,obj
CLEAN|Create in me a __ heart|ot,thm,psalm
CLOAK|Elijah's mantle|ot,obj
COAL|Burning one touched Isaiah's lips|ot,obj
COAT|Joseph's of many colors|ot,obj
COIN|Lost one in the parable|nt,obj
CORN|Grain plucked on the Sabbath|nt,obj
COUNT|Number your days; __ the cost|nt,thm
COURT|Outer area of the temple|ot,obj
COW|Milch kine of the Philistines|ot,obj
CRIB|Where the baby lay|nt,obj,xmas
CROP|Harvest yield|thm
CRY|Hear my __, O God|ot,thm,psalm
CUBIT|Ancient arm-length measure|ot,obj
CURSE|Opposite of blessing|ot,thm
CURTAIN|Veil of the tabernacle|ot,obj
DARK|Light shines in the __|nt,thm
DAWN|Morning's first light|thm,east
DEAD|Raised from the __|nt,thm,east
DEAF|Jesus made the __ to hear|nt,thm
DEATH|Swallowed up in victory|nt,thm,east
DEBT|Forgive us our __|nt,thm
DEEP|Calls to __|ot,thm,psalm
DEER|Panting for streams of water|ot,obj,psalm
DEN|Lions' one for Daniel|ot,obj,hero
DESERT|Wilderness|ot,plc
DEVOUT|Religious and prayerful|nt,thm
DIE|Appointed to __ once|nt,thm
DIVINE|Of God|thm
DOER|Be a __ of the word|nt,thm
DOOM|Judgment of the wicked|thm
DOVE|Spirit descended like one|nt,obj,pent
DOWN|Lay __ one's life|nt,thm
DREAM|Joseph had a coat and a __|ot,thm
DROSS|Impurity removed from silver|ot,obj
DUST|From __ you came|ot,thm
DUTY|Whole __ of man|ot,thm
DWELL|Abide in the house of the Lord|ot,thm,psalm
EAGLE|Mount up with wings like one|ot,obj
EARLY|Seek me __|ot,thm
EAST|Wise men came from the __|nt,thm,xmas
EBONY|Dark wood of Tyre's trade|ot,obj
EDGE|Of the sword|obj
EMBER|Coal in the fire|obj
ENEMY|Love your __|nt,thm
ENVY|Rottenness of the bones|ot,thm
EPHAH|Measure of grain|ot,obj
EPHOD|Priest's sacred vest|ot,obj
ERR|To go astray|thm
EVIL|Deliver us from __|nt,thm
EWE|Nathan's poor man's pet lamb|ot,obj
EXILE|Captivity in Babylon|ot,thm
EXTOL|Praise highly|thm,psalm
FADE|Grass withers, flowers __|ot,thm
FAIR|Beautiful|thm
FALL|Pride goes before a __|ot,thm
FAME|Spread abroad about Jesus|nt,thm
FAST|Go without food|thm
FATTED|Calf killed for the prodigal|nt,obj
FEAST|Banquet or festival|thm
FEED|__ my sheep|nt,thm,east
FEET|Beautiful on the mountains|ot,thm
FERRY|Boat across the Jordan|obj
FIELD|Sower's work place|nt,obj
FIGHT|The good __ of faith|nt,thm
FIND|Seek and ye shall __|nt,thm
FINGER|God wrote with his|ot,obj
FIRST|Seek the kingdom __|nt,thm
FLAX|Rahab hid spies under stalks of it|ot,obj
FLESH|Word became __|nt,thm,xmas
FLOCK|Shepherd's sheep|ot,obj
FLOOR|Threshing area|ot,obj
FLOUR|Widow's meal|ot,obj
FLUTE|Pipe at the funeral|nt,obj
FOLD|Sheepfold|nt,obj
FOOD|Daily bread|thm
FOOL|Says in his heart there is no God|ot,thm,psalm
FOOT|Lamp to my __|ot,thm,psalm
FORD|Shallow river crossing|ot,obj
FORGAVE|Father __ the prodigal|nt,thm
FORT|Strong tower|ot,obj
FOX|Has holes, said Jesus|nt,obj
FREE|Truth will make you __|nt,thm
FRIEND|One who sticks closer than a brother|ot,thm
FROG|Plague of Egypt|ot,obj
FRUIT|Of the Spirit|nt,thm
FULL|Cup runs over, __|ot,thm,psalm
GALL|Bitter drink on the cross|nt,obj,east
GARDEN|Eden or Gethsemane|ot,plc
GATE|Narrow way's entrance|nt,obj
GAVE|God so loved he __ his Son|nt,thm,xmas
GIFT|Free one of eternal life|nt,thm,xmas
GIRD|Bind up the loins|ot,thm
GIVE|It is better to __ than receive|nt,thm
GLAD|Be __ and rejoice|ot,thm
GLEAN|Ruth did this in the field|ot,thm
GLORY|Shekinah splendor|ot,thm,xmas
GNAT|Strain at one, swallow a camel|nt,obj
GOAT|Scapegoat|ot,obj
GOLD|Gift of the Magi|nt,obj,xmas
GOURD|Plant that shaded Jonah|ot,obj
GRAIN|Wheat or barley|obj
GRASS|The __ withers|ot,obj
GRAVE|Where Lazarus lay|nt,obj,east
GREAT|Commission or commandment|nt,thm
GREEN|Pastures of the shepherd psalm|ot,obj,psalm
GREET|Say hello with a holy kiss|nt,thm
GRIEF|Man of sorrows acquainted with it|ot,thm
GUARD|Soldiers at the tomb|nt,thm,east
GUEST|Wedding one without a garment|nt,thm
GUIDE|He will __ you into truth|nt,thm,pent
HAIL|Plague of Egypt or Gabriel's greeting|ot,thm
HALLEL|Psalms of praise|ot,thm,psalm
HAND|Right one of God|ot,thm
HARD|Pharaoh's heart was __|ot,thm
HARM|Do no __|thm
HAY|Wood, __, stubble|nt,obj
HEAD|Christ is __ of the church|nt,thm
HEAL|Jesus came to __|nt,thm
HEAR|Hear, O Israel|ot,thm
HEED|Pay attention to|thm
HEIR|Child of the promise|nt,thm
HELL|Place of torment|nt,thm
HELP|Ever-present one in trouble|ot,thm,psalm
HEM|Edge of Jesus' garment|nt,obj
HERB|Mint and dill|nt,obj
HERD|Gadarene swine|nt,obj
HIDE|__ me under the shadow of thy wings|ot,thm,psalm
HIGH|Most __ God|ot,thm
HILL|City set on one|nt,obj
HIRE|The laborer is worthy of his __|nt,thm
HOLY|Set apart|thm
HOME|Father's house|thm
HOOK|Fishing tool|nt,obj
HORN|Shofar|ot,obj
HOST|Heavenly army|nt,thm,xmas
HOUR|Jesus' __ had come|nt,thm
HOUSE|Built on the rock|nt,obj
HUMBLE|Opposite of proud|thm
HURT|Harm|thm
HUSK|What the prodigal's swine ate|nt,obj
HYSSOP|Plant used for sprinkling|ot,obj
IDLE|Not working|thm
INCENSE|Sweet smoke before the Lord|ot,obj
INK|Writing fluid|obj
IRON|Sharpens iron|ot,obj
ISLE|Island of Patmos|nt,plc
IVORY|Material of Solomon's throne|ot,obj
JAR|Widow's oil container|ot,obj
JAW|Samson used a donkey's|ot,obj
JUDGE|Righteous one|thm
JUST|Righteous and __|thm
KEEP|The Lord bless you and __ you|ot,thm
KID|Young goat|ot,obj
KILL|Thou shalt not __|ot,thm
KIND|Be __ to one another|nt,thm
KING|Jesus the __ of kings|nt,thm,xmas
KISS|Judas betrayed with one|nt,thm,east
KNEE|Every __ shall bow|nt,thm
KNEEL|Bow down in prayer|thm
KNIFE|Abraham raised one over Isaac|ot,obj
KNOCK|Ask, seek, __|nt,thm
KNOT|Tied|obj
LADDER|Jacob's dream stairway|ot,obj
LAMB|God's sacrifice|ot,obj,east
LAME|Man healed at the Beautiful Gate|nt,thm
LAND|Promised __|ot,thm
LAST|The first shall be __|nt,thm
LATE|Workers in the vineyard came __|nt,thm
LAUGH|Sarah did this at the promise|ot,thm
LAVER|Bronze basin of the tabernacle|ot,obj
LEAD|He __ me beside still waters|ot,thm,psalm
LEAF|Fig __ covering|ot,obj
LEAVEN|Yeast|nt,obj
LEECH|Has two daughters crying give|ot,obj
LEFT|Not the right|thm
LENT|Season of forty days before Easter|cur,east
LEPER|Cleansed by Jesus|nt,thm
LEVITE|Priestly tribe|ot,ppl
LIAR|One who bears false witness|nt,thm
LIFE|The way, the truth and the __|nt,thm
LIKE|Do unto others|nt,thm
LIMB|Branch|obj
LINE|Upon __ upon line|ot,thm
LINEN|Cloth of Jesus' burial|nt,obj,east
LIPS|Isaiah's touched by a coal|ot,thm
LIVE|The just shall __ by faith|ot,thm
LOAN|Lend without expecting repayment|nt,thm
LOCK|Door fastener|obj
LOFT|Upper room|nt,obj
LONG|Wait __ for the Lord|ot,thm
LOOK|__ unto me and be saved|ot,thm
LOOSE|Whatever you __ on earth|nt,thm
LOSE|Whoever would save his life will __ it|nt,thm
LOST|Sheep or coin|nt,thm
LOUD|Hosannas were __|nt,thm
LOWLY|Humble|thm
LUKE|Physician-writer of Acts|nt,ppl
LUST|Sinful desire|thm
MAD|Festus said Paul was __|nt,thm
MAID|Female servant|thm
MAKE|__ a joyful noise|ot,thm,psalm
MALE|And female created he them|ot,thm
MANNA|Heaven's bread in the desert|ot,obj
MANTLE|Elijah's cloak|ot,obj
MARCH|Seven times around Jericho|ot,thm
MARRY|Wed|thm
MARTYR|Witness unto death|nt,thm
MEAL|Offering of flour|ot,obj
MEAT|Food|thm
MEEK|Blessed are the __|nt,thm
MEND|Fishermen did this to nets|nt,thm
MERRY|Cheerful heart|ot,thm
MIGHT|Not by __ nor by power|ot,thm
MILE|Go the second __|nt,thm
MILL|Grinding stone place|nt,obj
MIND|Renewing of the __|nt,thm
MINT|Herb tithed by Pharisees|nt,obj
MIRE|Mud|ot,obj
MIST|Vapor|ot,obj
MOCK|Soldiers did this to Jesus|nt,thm,east
MOLE|Unclean animal|ot,obj
MONEY|Root of all evil is love of it|nt,thm
MOON|Turned to blood|ot,obj
MORN|Joy comes in the __|ot,thm,psalm
MOTH|Destroys treasures on earth|nt,obj
MOUNT|Sermon location|nt,plc
MOURN|Blessed are those who __|nt,thm
MULE|Absalom's ride|ot,obj
MUST|Ye __ be born again|nt,thm
MYRRH|Gift of the Magi for burial|nt,obj,xmas
NAIL|Pierced Jesus' hands|nt,obj,east
NAME|Above every __|nt,thm
NAKED|Adam and Eve were __ and unashamed|ot,thm
NEAR|Draw __ to God|nt,thm
NEED|God will supply all your __|nt,thm
NEST|Birds have them, said Jesus|nt,obj
NET|Peter's fishing tool|nt,obj
NEW|Behold, I make all things __|nt,thm
NEXT|Following|thm
NIGHT|Nicodemus came by __|nt,thm
NINE|Lepers who did not return|nt,thm
NOBLE|Bereans were more __|nt,thm
NOISE|Make a joyful __|ot,thm,psalm
NOON|Sixth hour|nt,thm
NOSE|Idols have them but cannot smell|ot,thm
NURSE|Care for a child|ot,thm
OAK|Abraham's trees at Mamre|ot,obj
OAR|Rowing tool|obj
OATH|Solemn promise|ot,thm
OBEY|Children __ your parents|nt,thm
OFFER|Present a sacrifice|ot,thm
OIL|Anointing substance|ot,obj
OLD|Ancient|thm
OMEGA|Last Greek letter, last of all|nt,thm
OPEN|__ the door|nt,thm
ORACLE|Word from God|ot,thm
ORPHAN|One without a father|ot,thm
OVEN|Fiery furnace|ot,obj
OWL|Unclean bird|ot,obj
OX|Ploughing animal|ot,obj
PAIN|Travail|thm
PALACE|King's house|ot,obj
PALM|Branch waved on the first Palm Sunday|nt,obj,east
PARTY|Prodigal's celebration|nt,thm
PASS|Red Sea crossing|ot,thm
PATH|Thy word is a lamp unto my __|ot,thm,psalm
PEAK|Mountain top|obj
PEARL|Of great price|nt,obj
PENCE|Coins in the good Samaritan's story|nt,obj
PIECE|Silver or bread|nt,obj
PIGEON|Poor person's offering|nt,obj
PILLAR|Of cloud or fire|ot,obj
PIPE|Musical instrument|ot,obj
PITCH|Covering for Noah's ark|ot,obj
PLAIN|Valley land|ot,plc
PLAN|I know the __ I have for you|ot,thm
PLANT|Sow or __|thm
PLEAD|Beg|thm
PLOW|Put your hand to the __|nt,obj
POOR|Blessed are the __ in spirit|nt,thm
PORT|Harbor|obj
POT|Of manna|ot,obj
POUR|__ out your heart|ot,thm
POWER|Dunamis|nt,thm,pent
PRAY|Talk to God|thm
PREACH|Proclaim the gospel|nt,thm
PRESS|Wine press|ot,obj
PRIDE|Goes before destruction|ot,thm
PRINCE|__ of Peace|ot,thm,xmas
PRISON|Where Paul and Silas sang|nt,plc
PROMISE|Covenant word|thm
PROUD|God opposes the __|nt,thm
PROVE|Test|thm
PURE|Blessed are the __ in heart|nt,thm
PURSE|Judas carried the money bag|nt,obj
QUAIL|Birds God sent to Israel|ot,obj
QUEEN|Sheba or Esther|ot,ppl
QUIET|Be still|ot,thm,psalm
RABBI|Teacher|nt,thm
RAIN|Fell for forty days|ot,thm
RAISE|Lazarus was __d|nt,thm,east
RAM|Substitute for Isaac|ot,obj
RAVEN|Fed Elijah|ot,obj
REACH|Extend|thm
READ|Peruse the scrolls|thm
REAP|Whatever one sows, he will __|nt,thm
REBEL|Defy authority|thm
REED|Bruised one he will not break|ot,obj
REIGN|Rule as king|thm
REND|Tear your heart, not your garments|ot,thm
REST|Sabbath|ot,thm
RICH|Camel and the needle's eye|nt,thm
RIGHT|Hand of God|thm
RING|Given to the prodigal|nt,obj
RISE|He shall __ again|nt,thm,east
RIVER|Flows from the throne|nt,obj
ROAD|Damascus __|nt,plc
ROAR|Lion's sound|ot,thm
ROBE|Purple one placed on Jesus|nt,obj,east
ROCK|Upon this __ I will build|nt,obj
ROD|Moses' staff|ot,obj
ROOF|Place of Peter's prayer|nt,obj
ROOM|Upper __|nt,obj
ROOT|Of Jesse|ot,thm,xmas
ROPE|Used to lower Paul in a basket|nt,obj
ROSE|Of Sharon|ot,obj
ROYAL|Priesthood|nt,thm
RUDDY|David's complexion|ot,thm
RULE|Govern|thm
RUN|Run the race|nt,thm
RUSH|Papyrus reed|ot,obj
SACK|Sackcloth|ot,obj
SAFE|In the arms of the Lord|thm
SALT|Of the earth|nt,obj
SAND|House built on it fell|nt,obj
SATAN|Adversary|nt,thm
SAVE|Rescue|thm
SAW|I came, I __|thm
SCALE|Jewish merchant's balance|ot,obj
SCARLET|Sins like __ made white as snow|ot,thm
SCEPTER|King's staff|ot,obj
SCOFF|Mock|thm
SEA|Red or Galilee|ot,plc
SEAL|Signet|nt,thm
SEAT|Throne|thm
SECOND|Coming or birth|nt,thm
SEED|Mustard|nt,obj
SEEK|And ye shall find|nt,thm
SELL|Gave up all to __ and buy the field|nt,thm
SEND|Here am I, __ me|ot,thm
SERVE|Joshua said we will __ the Lord|ot,thm
SEVEN|Perfect number|ot,thm
SEW|Fig leaves together|ot,thm
SHADE|Gourd gave Jonah |ot,thm
SHAME|Disgrace|thm
SHARE|Distribute|thm
SHARP|Two-edged sword is __|nt,thm
SHEAF|Bundle of grain|ot,obj
SHEEP|Lost one in the parable|nt,obj
SHEKEL|Weight of silver|ot,obj
SHELL|Husk|obj
SHEPHERD|Psalm 23 keeper|ot,thm,psalm
SHIELD|Of faith|nt,obj
SHINE|Let your light __|nt,thm
SHIP|Paul's wrecked vessel|nt,obj
SHOE|Sandal|obj
SHORE|Where the risen Lord cooked breakfast|nt,plc,east
SHOUT|Jericho's walls fell at it|ot,thm
SHRINE|Silver one made by Demetrius|nt,obj
SIGN|Of the times|nt,thm
SILK|Fine cloth|ot,obj
SILVER|Thirty pieces|nt,obj,east
SING|Make a joyful noise|ot,thm,psalm
SINNER|One who needs grace|nt,thm
SISTER|Martha's Mary|nt,thm
SIX|Days of creation work|ot,thm
SKIN|Leopard cannot change its spots|ot,thm
SKY|Heaven above|ot,thm
SLAVE|Servant of Christ|nt,thm
SLEEP|Jesus did in the boat|nt,thm
SMITE|Strike|thm
SMOKE|Mount Sinai was wrapped in it|ot,thm
SNOW|White as __|ot,thm
SOAP|Cleaning agent|ot,obj
SOLDIER|Good one of Christ Jesus|nt,thm
SOLE|Foot|obj
SOLOMON|Wise king|ot,ppl
SORROW|Man of __s|ot,thm,east
SOUL|Bless the Lord, O my __|ot,thm,psalm
SOUND|Of a rushing wind|nt,thm,pent
SOUTH|Direction of the queen of Sheba's home|nt,thm
SPAN|Hand's breadth|ot,obj
SPARE|Do not __ the rod|ot,thm
SPEAR|Weapon of Saul|ot,obj
SPELT|Grain in Ezekiel's bread|ot,obj
SPICE|Aroma of the tomb|nt,obj
SPRING|Fountain of water|thm
STAFF|Thy rod and thy __|ot,obj,psalm
STAIR|Jacob's ladder|ot,obj
STAND|Having done all, __|nt,thm
STAR|Guide of the Magi|nt,obj,xmas
STAY|Remain|thm
STEAL|Thou shalt not __|ot,thm
STEP|Walk one by one|thm
STICK|Rod|obj
STING|Where, O death, is thy __|nt,thm,east
STOCK|Livestock|ot,obj
STORM|Jesus calmed one|nt,thm
STRAW|Bricks without it|ot,obj
STREAM|Flowing water|ot,thm
STRIFE|Conflict|thm
STRONG|The Lord is my __ tower|ot,thm,psalm
STUMP|Of Jesse|ot,thm
SUN|Stood still for Joshua|ot,obj,hero
SUP|Take supper|nt,thm
SURE|Certain foundation|thm
SWEAR|Do not __|nt,thm
SWEET|Taste and see the Lord is good|ot,thm
SWIFT|Be __ to hear|nt,thm
SWORD|Of the Spirit|nt,obj
TABLE|Of the Lord|nt,obj
TAKE|__ up your cross|nt,thm
TALE|Story|thm
TALK|Speak|thm
TAME|The tongue no man can __|nt,thm
TASTE|__ and see|ot,thm,psalm
TEACH|Instruct|thm
TEAR|Wiped away by God|nt,thm
TELL|Go __ John what you hear|nt,thm
TEMPLE|Body of the Holy Spirit|nt,obj
TEND|Care for|thm
TENT|Paul's trade was making them|nt,obj
TERROR|Great fear|thm
TEST|Prove|thm
THANK|Give __s in all things|nt,thm
THIEF|Came to steal|nt,thm,east
THIN|Not thick|thm
THIRD|Day of resurrection|nt,thm,east
THIRST|Water for the one who __s|nt,thm
THORN|In the flesh|nt,obj,east
THREE|Days in the belly of the fish|ot,thm
THRONE|Seat of the king|nt,obj
THUMB|Priest anointed it|ot,obj
TIDE|Flow of the sea|obj
TIE|Bind|thm
TIME|A __ to every purpose|ot,thm
TITHE|One tenth|ot,thm
TOIL|Labor|thm
TONGUE|Pentecost flame|nt,obj,pent
TOOTH|An eye for an eye, a __ for a __|ot,thm
TORCH|Gideon's lamp|ot,obj
TOUCH|Lepers asked to be healed by one|nt,thm
TOWER|Of Babel|ot,obj
TOWN|Bethlehem|nt,plc
TRADE|Paul's tentmaking|nt,thm
TRAIN|Up a child|ot,thm
TRAP|Snare|thm
TREAD|Walk upon|thm
TREASURE|Where your __ is, there is your heart|nt,thm
TREE|Of life|ot,obj
TRIBE|One of Israel's twelve|ot,thm
TRIAL|Count it all joy|nt,thm
TRIBUTE|Render to Caesar|nt,thm
TROUBLE|Present help in __|ot,thm,psalm
TRUE|Vine|nt,thm
TRUMPET|Last one will sound|nt,obj
TRUST|In the Lord with all thine heart|ot,thm
TRUTH|Sets free|nt,thm
TUNIC|Seamless one|nt,obj,east
TURN|Other cheek|nt,thm
TWELVE|Tribes or apostles|ot,thm
TWICE|Two times|thm
TWIN|Jacob and Esau were __s|ot,thm
UNDER|Beneath|thm
UNITY|Oneness among believers|nt,thm
UPPER|Room of the Last Supper|nt,obj,east
USE|Employ|thm
VAIN|Thou shalt not take the name in __|ot,thm
VALE|Valley|ot,plc
VALLEY|Of the shadow of death|ot,psalm,plc
VASE|Alabaster one broken for Jesus|nt,obj,east
VEIL|Torn in two at the crucifixion|nt,obj,east
VERSE|Scripture line|thm
VESSEL|Chosen one|nt,obj
VIPER|Snake that bit Paul|nt,obj
VISION|Peter's on the rooftop|nt,thm
VOICE|Crying in the wilderness|nt,thm
VOID|Without form and __|ot,thm
VOW|Solemn promise|ot,thm
WAGE|Pay|thm
WAIL|Cry loudly|thm
WAIT|On the Lord|ot,thm
WAKE|Watch and pray|thm
WALK|__ by faith|nt,thm
WALL|Of Jericho|ot,obj
WANT|I shall not __|ot,thm,psalm
WAR|In heaven|nt,thm
WASH|Pilate's hands|nt,thm,east
WATCH|Keep __ and pray|nt,thm,east
WATER|Turned to wine|nt,obj
WAVE|Offering gesture|ot,thm
WAY|The truth and the life|nt,thm
WEAK|Strong in the Lord when I am __|nt,thm
WEALTH|Riches|thm
WEAVE|Make cloth|thm
WEDDING|Cana celebration|nt,thm
WEEK|Seven days|ot,thm
WEEP|Jesus did at Lazarus' tomb|nt,thm
WELL|Of Jacob|nt,obj
WEST|Direction|thm
WHALE|Great fish of Jonah|ot,obj
WHEAT|Grain and tares|nt,obj
WHEEL|Ezekiel saw one within a wheel|ot,obj
WHIP|Jesus made one of cords|nt,obj
WHITE|As snow|ot,thm
WICKED|Evil|thm
WIDOW|Two mites|nt,thm
WIFE|Helper for Adam|ot,thm
WILD|Honey and locusts|nt,thm
WILL|Thy __ be done|nt,thm
WIN|Gain|thm
WIND|Blows where it wishes|nt,thm,pent
WINE|New in old wineskins|nt,obj
WING|Under His __s|ot,thm,psalm
WISE|Men from the East|nt,thm,xmas
WISH|Desire|thm
WITH|Immanuel, God __ us|nt,thm,xmas
WITNESS|Testifier|nt,thm
WIVES|Submit to husbands|nt,thm
WOMAN|Created from Adam's rib|ot,thm
WOMB|Jacob and Esau struggled in it|ot,thm
WOOD|Of the cross|nt,obj,east
WOOL|White as __|ot,obj
WORD|In the beginning was the __|nt,thm,xmas
WORK|Faith without __s is dead|nt,thm
WORLD|God so loved the __|nt,thm
WORM|Does not die|nt,thm
WORSHIP|Adore in spirit|thm
WOUND|Stripes that heal|ot,thm
WRATH|Fierce anger|thm
WREATH|Crown|obj
WRITE|Pen the words|thm
WRONG|Opposite of right|thm
YEAR|Of Jubilee|ot,thm
YEAST|Leaven|nt,obj
YIELD|Harvest|thm
YOKE|My __ is easy|nt,obj
YOUNG|Let no man despise your youth|nt,thm
ZEAL|Fervor|thm
AM|I __ that I am|ot,thm
AH|Cry of Jeremiah: __, Lord God|ot,thm
AS|Let your light shine __ men see|nt,thm
AT|Knock __ the door|nt,thm
BE|__ still and know|ot,thm,psalm
BY|Not __ might nor by power|ot,thm
GO|__ into all the world|nt,thm
HE|__ is risen|nt,thm,east
IF|__ you love me, keep my commandments|nt,thm
IN|Abide __ me|nt,thm
IS|God __ love|nt,thm
IT|__ is finished|nt,thm,east
ME|Here am I, send __|ot,thm
MY|The Lord is __ shepherd|ot,thm,psalm
NO|Thou shalt have __ other gods|ot,thm
OF|Son __ God|nt,thm
OH|__ taste and see|ot,thm,psalm
ON|Cast your cares __ him|nt,thm
OR|Choose life __ death|ot,thm
SO|God __ loved the world|nt,thm
TO|Come __ me, all who labor|nt,thm
UP|Lift your eyes __|ot,thm
US|Emmanuel, God with __|nt,thm,xmas
WE|__ love because he first loved us|nt,thm
YE|__ must be born again|nt,thm
EL|Hebrew word for God|ot,thm
OX|Muzzle not the __ that treads grain|nt,obj
LO|Behold; I am with you always|nt,thm
BAPTIST|Denomination of immersion|cur,thm
CATHOLIC|Church led from Rome|cur,thm
LUTHERAN|Denomination named after Martin|cur,thm
METHODIST|Wesleyan denomination|cur,thm
QUAKER|Friends church member|cur,thm
SALVATION|__ Army, red-kettle charity|cur,thm
PASTOR|Shepherd of a local church|cur,ppl
BISHOP|Overseer of many churches|cur,ppl
USHER|Welcomes people to church|cur,ppl
CHOIR|Church singers|cur,thm
GOSPEL|Good news music|cur,thm
ORGAN|Instrument in many sanctuaries|cur,obj
PIANO|Keyboard instrument in worship|cur,obj
DRUMS|Worship band percussion|cur,obj
GUITAR|String instrument in praise bands|cur,obj
PULPIT|Preacher's platform|cur,obj
PEW|Church bench|cur,obj
AISLE|Walkway between pews|cur,obj
STEEPLE|Church tower|cur,obj
CHAPEL|Small place of worship|cur,plc
CATHEDRAL|Seat of a bishop|cur,plc
MISSION|Sending of the church|cur,thm
OUTREACH|Church service to the community|cur,thm
YOUTH|Church group of teens|cur,thm
SUNDAY|Day of weekly worship|cur,thm,east
SCHOOL|Sunday __ for children|cur,thm
CHOIR|Sing in the church __|cur,thm
BAND|Praise team|cur,thm
OFFERING|Gifts given in service|cur,thm
TESTIMONY|Story of what God has done|cur,thm
VIGIL|Night of prayer|cur,thm
RETREAT|Quiet time away with God|cur,thm
CRUSADE|Large evangelistic meeting|cur,thm
REVIVAL|Awakening of the church|cur,thm
PODCAST|Sermon you can listen to online|cur,thm
RADIO|Christian broadcast medium|cur,obj
BIBLE|Book of books|cur,obj
APP|Phone tool to read Scripture|cur,obj
RCCG|Nigerian church with a Redeemed name|cur,thm
ADEBOYE|General Overseer of the RCCG|cur,ppl
OYEDEPO|Founder of Living Faith Church|cur,ppl
KUMUYI|Founder of Deeper Life|cur,ppl
GRAHAM|Evangelist Billy or Franklin|cur,ppl
JAKES|Bishop T.D. of The Potter's House|cur,ppl
OSTEEN|Lakewood Church pastor Joel|cur,ppl
WARREN|Author of The Purpose Driven Life|cur,ppl
PIPER|Pastor and author John of Desiring God|cur,ppl
TOMLIN|Worship leader Chris|cur,ppl
REDMAN|Worship writer of 10,000 Reasons|cur,ppl
HILLSONG|Australian worship church|cur,thm
BETHEL|California church music group|cur,thm
ELEVATION|Worship group of 'Graves into Gardens'|cur,thm
GAITHER|Gospel family of 'Because He Lives'|cur,ppl
SOUTHERN|Gospel music style from the South|cur,thm
HOSANNA|Save now! cried the crowd|nt,thm,east
PSALMIST|Writer of songs, like David|ot,ppl,psalm
LYRE|Stringed instrument of old|ot,obj,psalm
HARP|David played it for Saul|ot,obj,psalm
TIMBREL|Miriam's hand drum|ot,obj,psalm
CYMBAL|Loud instrument of praise|ot,obj,psalm
TRUMPET|Praise him with the sound of it|ot,obj,psalm
FLUTE|Pipe of praise|ot,obj,psalm
DANCE|Praise him with timbrel and __|ot,thm,psalm
THANKS|Enter his gates with __giving|ot,thm,psalm
SHOUT|__ for joy|ot,thm,psalm
REJOICE|Be glad|thm,psalm
LAUD|Praise|thm,psalm
EXALT|Lift up|thm,psalm
GLADNESS|Serve the Lord with __|ot,thm,psalm
FLAME|Tongues of fire looked like these|nt,thm,pent
WIND|Rushing mighty __|nt,thm,pent
FIRE|Tongues of __ at Pentecost|nt,thm,pent
UPPER|__ room where the disciples waited|nt,obj,pent
LANGUAGE|Tongues spoken at Pentecost|nt,thm,pent
PARTHIANS|Listed among the Pentecost crowd|nt,ppl,pent
MEDES|Listed among the Pentecost crowd|nt,ppl,pent
ELAMITES|Listed among the Pentecost crowd|nt,ppl,pent
FILLED|They were all __ with the Holy Spirit|nt,thm,pent
WITNESS|You shall be my __s|nt,thm,pent
JOEL|Prophet quoted by Peter at Pentecost|nt,ppl,pent
HARVEST|Firstfruits feast|ot,thm,pent
SHAVUOT|Feast of weeks|ot,thm,pent
ADVENT|Season of waiting before Christmas|cur,thm,xmas
MANGER|Bed of the baby Jesus|nt,obj,xmas
STABLE|Place of the birth|nt,plc,xmas
ANGELS|Sang glory to God in the highest|nt,thm,xmas
BETHLEHEM|Town of David and the birth|nt,plc,xmas
SAVIOR|Born in the city of David|nt,thm,xmas
HOLLY|Christmas greenery|cur,obj,xmas
WREATH|Advent candle ring|cur,obj,xmas
NOEL|Christmas, in French carols|cur,thm,xmas
NATIVITY|Scene of the birth|cur,thm,xmas
DECEMBER|Month of Christmas|cur,thm,xmas
TREE|Decorated at Christmas|cur,obj,xmas
GIFTS|Gold, frankincense and myrrh|nt,obj,xmas
CENSUS|Reason for Joseph's travel|nt,thm,xmas
DONKEY|Mary's traveling beast, tradition says|nt,obj,xmas
SWADDLING|Cloth wrapped around the babe|nt,obj,xmas
GOODWILL|Peace on earth and __ to men|nt,thm,xmas
CALVARY|Hill of the crucifixion|nt,plc,east
RESURRECT|Rise from the dead|nt,thm,east
EASTER|Feast of the resurrection|cur,thm,east
PALMS|Waved on Palm Sunday|nt,obj,east
DONKEY|Jesus rode one into Jerusalem|nt,obj,east
PASSOVER|Feast before the crucifixion|ot,thm,east
SUPPER|Last meal with the twelve|nt,thm,east
CROSS|Instrument of the crucifixion|nt,obj,east
THORNS|Crown woven for Jesus|nt,obj,east
NAILS|Pierced the hands|nt,obj,east
SPEAR|Pierced his side|nt,obj,east
VINEGAR|Offered on a sponge|nt,obj,east
ANGEL|Rolled the stone from the tomb|nt,thm,east
LINENS|Left in the empty tomb|nt,obj,east
GARDENER|Whom Mary thought Jesus was|nt,ppl,east
BREAKFAST|Jesus cooked fish on the shore|nt,thm,east
ASCEND|Go up to heaven|nt,thm,east
LENT|Season of fasting before Easter|cur,thm,east
LILIES|Easter flowers|cur,obj,east
`;

export const EVENT_TAGS = ['xmas', 'east', 'pent', 'hero', 'psalm'];

export function parseBank(raw = RAW) {
  const out = [];
  raw.split('\n').forEach((line) => {
    line = line.trim();
    if (!line) return;
    const [a, c = '', tags = '', e = ''] = line.split('|');
    if (!/^[A-Z]{2,9}$/.test(a)) { console.warn('bad answer', a); return; }
    out.push({ id: out.length, a, c, e, tags: tags.split(',').filter(Boolean) });
  });
  return out;
}

export const BANK = parseBank();
