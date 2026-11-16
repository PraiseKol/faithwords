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
ABNER|Saul's army commander|ot,ppl
ADONIJAH|David's son who claimed the throne|ot,ppl
AMASA|Commander killed by Joab|ot,ppl
ARAUNAH|Sold David a threshing floor|ot,ppl
ARIEL|Name for Jerusalem|ot,plc
BEZALEL|Craftsman of the tabernacle|ot,ppl
BILDAD|Job's friend from Shuah|ot,ppl
BLASTUS|Herod's chamberlain|nt,ppl
CHLOE|Woman whose household reported to Paul|nt,ppl
DIANA|Goddess of the Ephesians|nt,ppl
ELIHU|Young friend who spoke to Job|ot,ppl
ENDOR|Where Saul visited a medium|ot,plc
EPHRAIM|Joseph's younger son|ot,ppl
GOMER|Hosea's wife|ot,ppl
IRIJAH|Sentry who arrested Jeremiah|ot,ppl
ITHAMAR|Aaron's youngest son|ot,ppl
JULIUS|Centurion who escorted Paul|nt,ppl
KENITE|Tribe of Jael|ot,ppl
KISH|Saul's father|ot,ppl
MAHLON|Ruth's first husband|ot,ppl
MANOAH|Samson's father|ot,ppl
MICAIAH|Prophet who told Ahab the truth|ot,ppl
MOLECH|Idol of child sacrifice|ot,ppl
OG|King of Bashan|ot,ppl
PHARES|Son of Judah and Tamar|ot,ppl
TROPHIMUS|Ephesian friend of Paul|nt,ppl
ANAK|Ancestor of giants|ot,ppl
ASHUR|Son of Shem|ot,ppl
BELA|One of the five cities|ot,plc
BIRSHA|King of Gomorrah|ot,ppl
BUZ|Nahor's son|ot,ppl
COS|Island visited by Paul|nt,plc
DEDAN|Son of Raamah|ot,ppl
ENON|Place near Salim where John baptized|nt,plc
ER|Judah's wicked firstborn|ot,ppl
ESHCOL|Valley of the huge cluster|ot,plc
HAMATH|Northern border city|ot,plc
HITTITE|Uriah's people|ot,ppl
IDUMEA|Land of Herod's family|nt,plc
IKONIUM|City of Paul's first journey|nt,plc
ISSACHAR|Tribe of the strong donkey|ot,ppl
JABESH|City Saul rescued|ot,plc
JAPHETH|Noah's youngest son|ot,ppl
JEBUS|Early name of Jerusalem|ot,plc
JEZREEL|Valley of Naboth's vineyard|ot,plc
MAHANAIM|Place where Jacob met angels|ot,plc
MARAH|Bitter water|ot,plc
MEDIA|Land with the Persians|ot,plc
MIZPAH|Watchtower place of Laban and Jacob|ot,plc
OPHIR|Land of fine gold|ot,plc
PATARA|Port on Paul's last voyage|nt,plc
PHRYGIA|Region of Asia Minor|nt,plc
TARSHISH|Where Jonah wanted to flee|ot,plc
TIBERIAS|City on the Sea of Galilee|nt,plc
UZ|Land of Job|ot,plc
ABHOR|Hate what is evil|thm
ABOUND|Overflow with hope|thm
ABYSS|Bottomless pit|thm
ACCORD|One __ in prayer|thm
AFAR|From __ off Peter followed|thm
AFFLICT|Cause suffering to|thm
ALOES|Spice brought with myrrh|obj
AMBER|Glowing color in Ezekiel's vision|obj
ANCIENT|Of old|thm
ANOINT|Pour oil on|thm
APPLE|Of God's eye|obj
ARCH|Chief angel prefix|thm
ASSEMBLE|Gather together|thm
ASTRAY|Like sheep gone __|thm
AWAKE|Wake up, sleeper|thm
BALM|Healing ointment of Gilead|obj
BASKET|Paul escaped in one|obj
BATHE|Wash|thm
BEHOLD|Look!|thm
BESEECH|Plead earnestly|thm
BETRAY|Hand over as Judas did|east
BIND|Tie up|thm
BITTER|Like the waters of Marah|thm
BLAME|Find fault|thm
BLEED|Shed blood|thm
BLOOM|Flower|thm
BOLDLY|With courage|thm
BONDAGE|Slavery|thm
BORROW|Take on loan|thm
BOUGH|Tree branch|obj
BOUND|Tied up|thm
BRIGHT|Shining|thm
BURDEN|Heavy load|thm
CAGE|Holds birds|obj
CALM|Jesus stilled the storm into a great __|thm
CARPENTER|Joseph's trade|nt
CAST|Throw|thm
CELL|Where Paul and Silas sang|obj
CHEER|Be of good __|thm
CHERISH|Hold dear|thm
CHOOSE|Select this day whom you will serve|thm
CLEANSE|Wash away sin|thm
CLEAR|Plain|thm
CLOTH|Fabric|obj
COMFORT|Console|thm
COMMAND|Order|thm
COMPASS|Surround|thm
CONFESS|Admit sins|thm
CONQUER|More than conquerors|thm
COUNSEL|Advice|thm
COURAGE|Be strong and of good __|thm
COVER|Hide|thm
CRAFT|Skill|thm
CREATE|Make from nothing|thm
CRIED|Called out loudly|thm
CRUSH|Bruise|thm
DECREE|Royal command|thm
DEED|Act|thm
DELIGHT|Take __ in the Lord|psalm
DENY|Refuse to acknowledge|east
DESIRE|Longing|thm
DINE|Eat|thm
DIRGE|Funeral song|thm
DITCH|Blind leading blind falls in|obj
DIVIDE|Split|thm
DOUBT|Thomas's trouble|thm
DOVES|Sold in the temple|obj
DRAGON|Great red one in Revelation|thm
DREAD|Great fear|thm
DRINK|Living water to __|thm
DRUNK|Not sober|thm
EARNEST|Sincere|thm
ELECT|Chosen|thm
ELM|Tree in Hosea|obj
EMPTY|Void|thm
ENDURE|Last|thm
ENTER|Go in by the narrow gate|thm
ENTREAT|Plead|thm
ERROR|Mistake|thm
ETERNAL|Everlasting|thm
EXPECT|Look for|thm
FAIL|Not succeed|thm
FAINT|Weary|thm
FALSE|Untrue prophet|thm
FAMINE|Seven years of lack|ot
FEAR|Be not afraid|thm
FERVENT|Burning with zeal|thm
FIERY|Like the furnace|thm
FIRM|Steadfast|thm
FLEE|Run away|thm
FLOWER|Of the field|obj
FOLLOW|Come after Me|thm
FORSAKE|Abandon|thm
FOUND|Lost sheep was __|thm
FOUNTAIN|Spring of water|obj
GARMENT|Robe|obj
GATHER|Come together|thm
GAZE|Look steadily|thm
GENTLE|Mild|thm
GLORIFY|Honor|thm
GLUTTON|Overeater|thm
GOLDEN|Calf made by Aaron|thm
GRACIOUS|Merciful|thm
GROAN|Creation does this|thm
GROW|Increase|thm
GUILT|Shame of sin|thm
HAIR|Samson's strength|obj
HALLOW|Make holy|thm
HANG|Suspend|thm
HASTE|Hurry|thm
HATE|Opposite of love|thm
HEARD|Listened|thm
HEAVY|Weighted|thm
HOLD|Grasp|thm
HOLINESS|Being set apart|thm
HONOR|Respect your father and mother|thm
HORSE|Egyptian warrior's animal|obj
HUNGER|Need of food|thm
HUSBAND|Husband and wife|thm
IMAGE|Likeness of God|thm
INHERIT|Receive as an heir|thm
INNOCENT|Not guilty|thm
JACKAL|Wild desert dog|obj
JEALOUS|God is a __ God|thm
JEWEL|Precious stone|obj
JOURNEY|Trip|thm
JUSTICE|Roll down like waters|thm
KEPT|Held|thm
KINDLE|Light a fire|thm
KNOW|Understand|thm
LABOR|Work|thm
LACK|Need|thm
LAMBS|Feed my __|thm
LEAN|Do not __ on your own understanding|thm
LEAP|Jump for joy|thm
LEND|Loan|thm
LEPROSY|Disease cleansed by Jesus|nt
LIFT|Raise|thm
LOAVES|Five were fed to thousands|nt
LOVELY|Pleasing|thm
MAIDEN|Young woman|ppl
MAKER|Creator|thm
MARVEL|Wonder|thm
MASTER|Teacher|thm
MEET|Come together|thm
MELT|Mountains __ like wax|thm
MIGHTY|Strong|thm
MINISTER|Servant|thm
MOAN|Groan|thm
MORTAL|Not eternal|thm
MOSS|Soft plant|obj
MOTHER|Honor your father and __|thm
MOUTH|Speaks from heart's abundance|thm
MURDER|Kill|thm
MUTE|Unable to speak|thm
MYRTLE|Tree for the desert|obj
NARROW|Gate or way|thm
NATION|People|thm
NEEDLE|Camel's passage|obj
NEIGHBOR|Love your __|thm
NORTH|Direction|thm
ORDAIN|Appoint|thm
PALE|Horse of death|obj
PATIENT|Waiting calmly|thm
PAUSE|Selah|psalm
PEARLS|Do not cast before swine|obj
PERFECT|Complete|thm
PERISH|Die|thm
PIERCE|Puncture|east
PIG|Prodigal's job|obj
PITY|Compassion|thm
PLEASE|Delight|thm
PLENTY|Abundance|thm
POOL|Bethesda's waters|obj
POTTER|Clay shaper|obj
PRECEPT|Command|thm
PRUNE|Cut vines|thm
PURSUE|Chase|thm
QUICK|Fast|thm
RANSOM|Price of release|thm
REAL|True|thm
REALM|Kingdom|thm
REBUKE|Scold|thm
RECEIVE|Accept|thm
REMNANT|Small left over group|thm
REMOVE|Take away|thm
RENEW|Make new again|thm
REPAY|Pay back|thm
ROB|Steal|thm
ROUND|Circular|thm
RUBY|Red gem|obj
RUST|Corrodes treasures on earth|obj
SAIL|Move over water|thm
SAINTS|Holy ones|thm
SAKE|For His name's __|thm
SANDAL|Footwear|obj
SAY|Speak|thm
SCRIBE|Writer of the law|thm
SEASON|A time for everything|thm
SEE|Look|thm
SEEN|Observed|thm
SERVANT|Slave|thm
SHEARER|Silent lamb before him|obj
SHED|Pour out|thm
SHOWER|Rain|obj
SHUT|Close|thm
SICK|Ill|thm
SIGHT|Vision|thm
SILENT|Quiet|thm
SINK|Go down|thm
SIT|Be seated|thm
SLAY|Kill|thm
SLOW|Not fast|thm
SMALL|Little|thm
SOAR|Fly high|thm
SOBER|Clear-minded|thm
SOFT|Gentle answer turns away wrath|thm
SOIL|Ground|obj
SOLD|Joseph was __ into Egypt|ot
SOON|Quickly|thm
SORE|Wound|thm
SPARROW|Small bird God watches|obj
SPEAK|Talk|thm
STIR|Move|thm
STORE|Save up|thm
STRENGTH|Power|thm
STRIKE|Hit|thm
STUMBLE|Trip|thm
SUFFER|Endure pain|thm
SUMMER|Warm season|thm
TARE|Weed sown among the wheat|obj
TEARS|Wiped away by God|thm
TEMPT|Entice|thm
THREAD|Cord|obj
THUNDER|Sons of __|thm
TIRED|Weary|thm
TRAMPLE|Tread upon|thm
TREMBLE|Shake|thm
TRIUMPH|Victory|thm
UNJUST|Not fair|thm
UNTO|To|thm
UPRIGHT|Righteous|thm
VALUE|Worth|thm
VICTORY|Win|thm
VILLAGE|Small town|plc
VINEYARD|Where laborers worked|obj
VIRGIN|Mary|xmas
VIRTUE|Goodness|thm
WAGES|Of sin is death|thm
WANDER|Roam|thm
WARM|Not cold|thm
WARN|Alert|thm
WEAPON|Armament|obj
WEARY|Tired|thm
WEED|Unwanted plant|obj
WEIGH|Measure heavy|thm
WELCOME|Greet|thm
WHISPER|Gentle voice to Elijah|thm
WINTER|Cold season|thm
WISDOM|Solomon's gift|thm
WITHER|Dry up|thm
WONDER|Marvel|thm
WORTH|Value|thm
YES|Affirm|thm
THEE|Old word for "you" (object)|thm
THOU|Old word for "you"|thm
THY|Old word for "your"|thm
THINE|"For ___ is the kingdom", yours|thm
THEIR|Belonging to them|thm
HATH|Old word for "has"|thm
DOTH|Old word for "does"|thm
SAITH|Old word for "says"|thm
LEST|"__ ye fall", in case|thm
NAY|No in the King James|thm
VERILY|Truly, truly|thm
WHOSO|Whoever|thm
WHEREFORE|For what reason|thm
HENCE|From here|thm
THENCE|From there|thm
HITHER|To this place|thm
THITHER|To that place|thm
WHITHER|Where to|thm
ERE|Before, in old English|thm
SHALT|"Thou __ not steal"|thm
WILT|"Thou __ keep him in perfect peace"|thm
WERT|Old form of "were"|thm
HAST|Old form of "have"|thm
DOST|Old form of "do"|thm
CANST|Old form of "can"|thm
WOT|Old word for "know"|thm
FORTH|Out, as in "bring ___"|thm
ALAS|Cry of sorrow|thm
OFT|Often, old style|thm
TARRY|Wait or stay a while|thm
FAIN|Gladly|thm
SPAKE|Old word for "spoke"|thm
SLEW|Old word for "killed"|thm
SMOTE|Struck|thm
BROKE|Shattered|thm
BIDDEN|Told to come|thm
HEWN|Cut with an axe|thm
HEWED|Chopped|thm
GIRT|Belted|thm
LOINS|Gird up your __|thm
RAIMENT|Clothing|thm
SMITTEN|Struck down|thm
SLAIN|Killed|thm
SOWN|Planted|thm
REAPED|Gathered grain|thm
BORNE|Carried|thm
SHORN|Sheared|thm
STRIVE|Struggle|thm
STRAIT|Narrow, as in the gate|thm
WAXED|Grew|thm
WROUGHT|Worked or made|thm
WROTE|Penned|thm
WRIT|Written|thm
YEARN|Long for|thm
YOKED|Joined together|thm
ALLELUIA|Praise the Lord!|psalm
MAGNIFY|Make great|psalm
BLESSING|Gift from God|thm
BLESSINGS|Gifts from God|thm
PRAYERS|Requests to God|thm
HYMNS|Sacred songs|psalm
PROPHETS|Messengers of God|thm
APOSTLES|Sent ones|thm
DISCIPLES|Followers of Christ|thm
SAVIOUR|Redeemer|xmas
REDEEMER|One who buys back|thm
CREATOR|Maker of heaven and earth|thm
ALMIGHTY|All-powerful|thm
IMMANUEL|God with us|xmas
JEHOVAH|Old name for the Lord|thm
YAHWEH|Sacred name of God|thm
ELOHIM|Hebrew word for God|thm
ADONAI|Hebrew word for Lord|thm
RABBONI|My Master|nt
MASTERS|Lords|thm
LORDS|Rulers|thm
KINGDOM|Realm of heaven|thm
QUEENS|Royal women|thm
PRINCES|Royal sons|thm
HERODIAN|Follower of Herod|nt
SADDUCEE|Jewish sect that denied resurrection|nt
PHARISEE|Jewish sect of strict law-keepers|nt
SANHEDRIN|Jewish high council|nt
LEGION|Demon name|nt
SOLDIERS|Guards at the cross|east
CROSSES|Calvary's three|east
CRUCIFY|Nail to a cross|east
BURIED|Laid in a tomb|east
ASCENSION|Jesus going up|nt
EPIPHANY|Magi's visit celebration|xmas
LENTEN|Of the pre-Easter fast|east
CHRISTMAS|Birth of Christ celebration|xmas
HOLIDAY|Holy day|thm
SABBATHS|Days of rest|thm
DENARIUS|Roman coin|obj
TALENTS|Parable coins|obj
MITE|Widow's tiny coin|obj
OMER|Measure of manna|obj
HIN|Liquid measure|obj
BATH|Hebrew liquid measure|obj
HOMER|Large dry measure|obj
SEAH|Measure of flour|obj
LOG|Smallest liquid measure|obj
SASH|Belt of cloth|obj
TURBAN|Headwrap|obj
MITRE|High priest's headdress|obj
URIM|Priestly oracle stone|obj
THUMMIM|Partner to Urim|obj
CENSER|Incense holder|obj
EWER|Water pitcher|obj
CRUSE|Small jar|obj
FLAGON|Wine vessel|obj
CHALICE|Cup of communion|obj
GOBLET|Fancy cup|obj
PLATTER|John's head was served on one|obj
CHARGER|Large plate|obj
TRAY|Serving dish|obj
KETTLE|Cooking pot|obj
CAULDRON|Large pot|obj
SKILLET|Pan|obj
FORGE|Smith's fire|obj
ANVIL|Smith's block|obj
HAMMER|Smith's tool|obj
ADZE|Carpenter's tool|obj
PLUMB|Line on a wall in Amos|obj
SICKLE|Harvest blade|obj
SCYTHE|Long reaping blade|obj
FLAIL|Grain-beating tool|obj
SHOVEL|Digging tool|obj
SPADE|Digging tool|obj
TACKLE|Boat gear|obj
HELM|Ship's steering|obj
MAST|Ship's pole|obj
DECK|Ship's floor|obj
HULL|Ship's body|obj
KEEL|Ship's base|obj
PROW|Ship's front|obj
STERN|Ship's back, where Jesus slept|obj
QUIVER|Arrow holder|obj
JAVELIN|Light spear|obj
DAGGER|Short blade|obj
SIEGE|Surround a city|thm
TOWERS|Watch buildings|obj
RAMPART|Defensive wall|obj
MOAT|Ditch around a castle|obj
CITADEL|Fortress|obj
GATES|City entrances|obj
BARS|Locks of iron|obj
BOLT|Door lock|obj
KEYS|Kingdom's __ given to Peter|obj
LOCKS|Fasteners|obj
LAMPS|Wise virgins' lights|obj
LANTERN|Light carried by soldiers|obj
CANDLES|Lights|obj
WICK|Candle's thread|obj
WOOLEN|Made of wool|obj
SACKCLOTH|Mourning cloth|obj
DUSTY|Covered in dirt|thm
MUD|Clay made by Jesus for the blind man|obj
BRICK|Egypt's slave product|obj
BRICKS|Israel's burden in Egypt|obj
GRAINS|Seeds of cereal|obj
OATS|Cereal|obj
RYE|Cereal grain|obj
MILLET|Small grain|obj
FIGS|Sweet fruit|obj
DATES|Palm fruit|obj
RAISIN|Dried grape|obj
CAKES|Baked treats|obj
LENTIL|Esau's stew bean|obj
LENTILS|Esau's pottage|obj
BEANS|Legumes|obj
LEEKS|Egyptian vegetable|obj
GARLIC|Egyptian bulb|obj
ONION|Egyptian bulb|obj
ONIONS|Egyptian bulbs|obj
CUCUMBER|Egyptian vegetable|obj
MELON|Egyptian fruit|obj
MELONS|Egyptian fruits|obj
CUMIN|Spice tithed by Pharisees|obj
DILL|Spice tithed by Pharisees|obj
RUE|Bitter herb|obj
CORIANDER|Manna looked like its seed|obj
SAFFRON|Spice in the Song of Songs|obj
CINNAMON|Sweet spice|obj
CASSIA|Spice in the anointing oil|obj
CALAMUS|Fragrant reed|obj
NARD|Costly perfume|obj
SPIKENARD|Costly perfume Mary poured|east
BALSAM|Aromatic gum|obj
GALBANUM|Incense ingredient|obj
ONYCHA|Incense ingredient|obj
STACTE|Incense ingredient|obj
A|1st letter of the alphabet|thm
A|1st vowel in the alphabet|thm
A|First letter of the name of the first man|thm
A|First letter of the book that follows John|bk
A|First letter of "Amen"|thm
A|Letter before B|thm
A|First letter of the Greek alphabet, Alpha|thm
A|Last letter of the name of the man who succeeded Moses|ppl
B|2nd letter of the alphabet|thm
B|First letter of the town where Jesus was born|plc
B|Letter after A|thm
B|Letter that sounds like a honey maker|thm
C|3rd letter of the alphabet|thm
C|Roman numeral for one hundred|thm
C|First letter of the place where Jesus turned water into wine, Cana|plc
C|First letter of the name of the first murderer|ot,ppl
C|Letter that sounds like the ocean|thm
C|First letter of Christmas|xmas
D|4th letter of the alphabet|thm
D|Roman numeral for five hundred|thm
D|First letter of the shepherd boy who killed Goliath|ppl
D|First letter of the lion-den prophet|ppl
D|Letter between C and E|thm
E|5th letter of the alphabet|thm
E|2nd vowel in the alphabet|thm
E|First letter of the first woman's name|thm
E|First letter of the first garden|plc
E|Last letter of the Gospel by the physician, Luke|bk
E|First letter of Easter|east
F|6th letter of the alphabet|thm
F|5th letter before K|thm
F|First letter of "forty", the days of rain on the ark|thm
F|First letter of "faith"|thm
F|Letter between E and G|thm
G|7th letter of the alphabet|thm
G|First letter of the first book of the Bible|bk
G|First letter of the garden where Jesus prayed before his arrest|plc
G|Letter between F and H|thm
H|8th letter of the alphabet|thm
H|Last letter of "Hallelujah"|psalm
H|First letter of the Greek "Hosanna"|thm
H|First letter of "heaven"|thm
H|Letter between G and I|thm
I|3rd vowel in the alphabet|thm
I|9th letter of the alphabet|thm
I|Roman numeral for one|thm
I|The letter that sounds like an eye|thm
I|First letter of the nation God renamed Jacob's family|plc
J|10th letter of the alphabet|thm
J|First letter of the name of the disciple that betrayed Jesus|east
J|First letter of the river where Jesus was baptized|plc
J|First letter of the Savior's name|thm
J|First letter of the holy city|plc
K|11th letter of the alphabet|thm
K|Last letter of the shortest Gospel, Mark|bk
K|First letter of the book after Samuel|bk
K|Letter after J|thm
L|12th letter of the alphabet|thm
L|Roman numeral for fifty|thm
L|First letter of the physician who wrote Acts|ppl
L|First letter of the season before Easter|east
L|Letter between K and M|thm
M|13th letter of the alphabet|thm
M|Roman numeral for one thousand|thm
M|Last letter of the town where Jesus was born|plc
M|First letter of the man who parted the Red Sea|ppl
M|First letter of the Gospel that opens the New Testament|bk
N|14th letter of the alphabet|thm
N|Last letter of "Amen"|thm
N|Last letter of the last book of the Bible, Revelation|bk
N|First letter of the man who built the ark|ppl
N|Letter between M and O|thm
O|4th vowel in the alphabet|thm
O|15th letter of the alphabet|thm
O|Last letter of the Greek alphabet, Omega|thm
O|Second letter of the name of the ark builder|ppl
O|First letter of the opening word of the Lord's Prayer, "Our"|thm
P|16th letter of the alphabet|thm
P|First letter of the apostle to the Gentiles|ppl
P|First letter of the feast of Fifty days, Pentecost|pent
P|First letter of the book of songs|bk
Q|17th letter of the alphabet|thm
Q|First letter of Sheba's royal title|thm
R|18th letter of the alphabet|thm
R|First letter of the last book of the Bible|bk
R|First letter of the woman whose name is a Moabite book|ppl
R|First letter of "risen"|east
R|Letter before S|thm
S|19th letter of the alphabet|thm
S|Last letter of the name of the first disciple to be martyred, James|ppl
S|Last letter of the name of the Savior, Jesus|thm
S|First letter of the mountain of the law|plc
S|First letter of the wisest king|ppl
T|20th letter of the alphabet|thm
T|Last letter of the name of the anointed one, Christ|thm
T|First letter of Tau, the cross-shaped Greek letter|thm
T|Last letter of "Advent"|xmas
T|Letter before U|thm
U|5th vowel in the alphabet|thm
U|21st letter of the alphabet|thm
U|Letter that sounds like "you"|thm
U|First letter of Bathsheba's husband|ppl
V|22nd letter of the alphabet|thm
V|3rd alphabet after S|thm
V|Roman numeral for five|thm
V|Letter before W|thm
W|23rd letter of the alphabet|thm
W|First letter of "worship"|thm
W|First letter of "wisdom"|thm
X|24th letter of the alphabet|thm
X|Roman numeral for ten|thm
X|Greek letter chi, the first of Christ's title|thm
X|Marks the spot, also a cross shape|thm
Y|25th letter of the alphabet|thm
Y|Letter that sounds like "why"|thm
Y|Last letter of the name of Jesus' mother|ppl
Y|Letter before Z|thm
Z|26th letter of the alphabet|thm
Z|Last letter of the alphabet|thm
Z|First letter of the holy hill|plc
Z|First letter of the tax collector who climbed a tree|ppl
A|Joth_m|ot,ppl
A|Frid_y|thm,east
A|Es_u|ot,ppl
A|P_rty|nt,thm
A|Gr_cious|thm
A|Sh_lt|thm
A|Tr_mple|thm
A|Hag_r|ot,ppl
A|Curt_in|ot,obj
A|L_zarus|nt,ppl
A|Ad_h|ot,ppl
A|Dun_mis|cur
A|Sc_le|ot,obj
A|Iss_char|ot,ppl
A|C_naan|plc
A|Ba_sha|ot,ppl
A|Pr_ise|thm,psalm
A|H_th|thm
A|He_rd|thm
A|Ah_b|ot,ppl
A|Le_p|thm
A|T_lk|thm
A|Eliph_z|ot,ppl
A|Sl_in|thm
A|Bar_k|ot,ppl,hero
A|Ramp_rt|obj
B|Cale_|ot,ppl,hero
B|Neigh_or|thm
B|Gal_anum|obj
B|Ta_itha|nt,ppl
B|Eliza_eth|nt,ppl,xmas
B|Re_uke|thm
B|O_ed|ot
B|A_igail|ot,ppl
B|Trem_le|thm
B|A_ijah|ot,ppl
B|Beershe_a|ot,plc
B|A_ednego|ot,ppl
B|Stum_le|thm
B|O_ey|nt,thm
B|Re_ekah|ot,ppl
B|No_le|nt,thm
B|Sab_ath|thm
B|The_es|ot,plc
B|Le_anon|ot,plc
B|E_ony|ot,obj
B|Jaco_|ot,ppl
B|La_or|thm
B|Para_le|thm
B|Cob_s|cur,ppl
B|He_ron|plc
B|Ab_a|thm,nt
C|Inno_ent|thm
C|Rea_h|thm
C|Ta_kle|obj
C|Antio_h|plc
C|She_hem|ot,plc
C|Mer_yme|cur
C|Euty_hus|nt,ppl
C|A_haia|nt,plc
C|Synty_he|nt,ppl
C|Sina_h|cur,ppl
C|Ri_h|nt,thm
C|Lo_ks|obj
C|Spi_es|east
C|Resurre_t|nt,thm,east
C|Ar_h|thm
C|Pie_e|nt,obj
C|Sta_te|obj
C|Euni_e|nt,ppl
C|Fran_is|cur
C|A_ts|bk,pent
C|Tea_h|thm
C|Lame_h|ot,ppl
C|Eno_h|ot,ppl
C|Kno_k|thm
C|Tychi_us|nt,ppl
C|Si_kle|obj
D|Mai_en|ppl
D|Can_ace|nt,ppl
D|Soun_|nt,thm,pent
D|Ju_ith|ot,ppl
D|Rud_y|ot,thm
D|Sad_ucee|nt
D|Bid_en|thm
D|Can_les|obj
D|Tire_|thm
D|Ju_ah|ot,ppl
D|Za_ok|ot,ppl
D|Ka_esh|ot,plc
D|Wis_om|thm
D|A_eboye|cur,ppl
D|Sha_ow|psalm
D|Ju_ge|thm
D|Fiel_|nt,obj
D|Bur_en|thm
D|Lad_er|ot,obj
D|Gour_|ot,obj
D|Gla_ness|ot,thm,psalm
D|Swa_dling|nt,obj,xmas
D|Sar_is|nt,plc
D|An_rew|nt,ppl
D|Ju_ea|plc
D|Caul_ron|obj
E|Gabri_l|nt,ppl,xmas
E|D_ny|east
E|Whal_|ot,obj
E|Sle_p|nt,thm
E|Lin_ns|nt,obj,east
E|K_ep|ot,thm
E|Idl_|thm
E|Wax_d|thm
E|Gobl_t|obj
E|L_per|nt,thm
E|Rach_l|ot,ppl
E|Emb_r|obj
E|Des_rt|ot,plc
E|Ab_l|ot,ppl
E|Belov_d|thm
E|Pip_|ot,obj
E|N_hemiah|ot,ppl,hero
E|Abov_|nt,thm
E|Hebr_ws|bk
E|Ke_l|obj
E|L_aven|nt,obj
E|Bibl_|thm
E|Serp_nt|thm
E|Writ_|thm
E|M_nnonite|cur
E|Dov_|thm
F|Cha_f|psalm
F|Af_lict|thm
F|Swi_t|nt,thm
F|Of_er|ot,thm
F|Sco_f|thm
F|Com_orter|pent
G|Fi_ht|nt,thm
G|Si_ht|thm
G|Phry_ia|nt,plc
G|An_lican|cur
G|An_el|thm,xmas
G|Vi_il|cur,thm
G|Villa_e|plc
G|Boaner_es|nt,ppl
G|An_er|thm
G|Be_at|ot,thm
G|E_lon|ot,ppl
G|Dir_e|thm
G|A_ag|ot,ppl
G|Dag_er|obj
G|Ni_ht|cur,xmas
G|Upri_ht|thm
G|Ri_ht|thm
G|Gil_al|ot,plc
G|Me_iddo|ot,plc
G|Wron_|thm
G|Jud_es|bk
G|Rcc_|cur
H|T_ence|thm
H|P_ares|ot,ppl
H|T_ank|nt,thm
H|C_eer|thm
H|Fait_|thm
H|Fait_ful|cur,xmas
H|C_ain|nt,obj
H|Ge_azi|ot,ppl
H|Yout_|cur,thm
H|Rut_|ot,ppl,hero
H|Boug_|obj
H|Ep_ah|ot,obj
H|C_apel|cur,plc
H|Ac_an|ot,ppl
H|P_inehas|ot,ppl
H|C_osen|cur
H|Fles_|nt,thm,xmas
H|Jos_ua|ot,ppl,hero
H|Bet_esda|nt,plc
H|P_ilippi|plc
H|Thit_er|thm
H|W_isper|thm
H|Mot_er|thm
H|Bet_uel|ot,ppl
H|W_ip|nt,obj
H|Orp_an|ot,thm
I|Sa_th|thm
I|Sm_tten|thm
I|M_cah|ot,ppl,xmas
I|V_rgin|xmas
I|Wedd_ng|nt,thm
I|Javel_n|obj
I|Fa_r|thm
I|Ethiop_a|nt,plc
I|Ca_n|ot,ppl
I|Pat_ent|thm
I|T_de|obj
I|Wh_te|ot,thm
I|Pla_n|ot,plc
I|Br_ght|thm
I|Publ_us|nt,ppl
I|Ano_nt|thm
I|G_ft|xmas
I|Ra_se|nt,thm,east
I|M_lk|thm
I|Sk_n|ot,thm
I|Bas_n|nt,obj,east
I|Adon_jah|ot,ppl
I|S_gn|nt,thm
I|Leg_on|nt
I|S_don|ot,plc
I|F_nger|ot,obj
K|Jac_al|obj
K|Than_s|thm
K|Moc_|nt,thm,east
K|Sic_|thm
K|Floc_|ot,obj
K|Don_ey|east
K|Sac_|ot,obj
K|La_ewood|cur
K|Stoc_|ot,obj
K|Bric_s|obj
K|Sac_cloth|obj
K|El_anah|ot,ppl
K|Wic_|obj
K|Quic_|thm
L|Ca_m|thm
L|Roya_|nt,thm
L|E_amites|nt,ppl,pent
L|Nai_s|east
L|So_d|ot
L|Cha_dea|ot,plc
L|Hal_el|ot,thm,psalm
L|F_ute|nt,obj
L|Ho_y|thm,pent
L|Gi_ead|ot,plc
L|Tertu_lus|nt,ppl
L|Mi_l|nt,obj
L|Bow_|nt,obj
L|Fal_|ot,thm
L|Se_ah|psalm
L|Kind_e|thm
L|A_ms|thm
L|A_oe|nt,obj,east
L|P_ead|thm
L|G_ean|ot,thm
L|Ga_ilee|plc
L|F_ax|ot,obj
L|Ca_amus|obj
L|Cha_ice|obj
L|Tel_|nt,thm
L|Bi_dad|ot,ppl
M|Ku_uyi|cur,ppl
M|Ca_el|thm
M|La_ps|obj
M|Cucu_ber|obj
M|To_b|east
M|Hel_et|thm
M|Trophi_us|nt,ppl
M|Co_pass|thm
M|I_age|thm
M|Ma_re|ot,plc
M|Wo_b|ot,thm
M|Dru_s|cur,obj
M|Redee_er|thm
M|Ga_aliel|nt,ppl
M|Em_anuel|xmas
M|Nicode_us|nt,ppl
M|Testi_ony|cur,thm
M|S_yrna|nt,plc
M|Ti_brel|ot,obj,psalm
M|Tho_as|nt,ppl,east
M|Thum_im|obj
M|E_maus|plc,east
M|Pal_s|nt,obj,east
M|Stu_p|ot,thm
M|Co_mand|thm
M|Su_mer|thm
N|O_esimus|nt,ppl
N|Alo_e|ot,thm
N|Tale_t|thm
N|Tu_ic|nt,obj,east
N|Melo_s|obj
N|Asce_d|nt,thm,east
N|Abou_d|thm
N|U_just|thm
N|K_ow|thm
N|Ri_g|nt,obj
N|Bra_ch|nt,obj
N|Sli_g|thm
N|Gideo_s|cur
N|Sow_|thm
N|Stro_g|ot,thm,psalm
N|Thi_e|thm
N|Lausan_e|cur
N|Roma_s|bk
N|Ha_nah|ot,ppl,hero
N|Si_g|ot,thm,psalm
N|Mag_ify|psalm
N|Ki_g|thm,xmas
N|Ce_sus|nt,thm,xmas
N|Sti_g|nt,thm,east
N|Eter_al|thm
N|Fra_klin|cur,ppl
O|Man_ah|ot,ppl
O|Nab_th|ot,ppl
O|End_r|ot,plc
O|S_dom|plc
O|Foll_w|thm
O|Rh_da|nt,ppl
O|En_s|ot
O|Y_ked|thm
O|Ascensi_n|nt
O|Rej_ice|thm,psalm
O|Iv_ry|ot,obj
O|D_rcas|nt,ppl
O|W_rk|nt,thm
O|S_uthern|cur,thm
O|M_ney|nt,thm
O|D_th|thm
O|Rans_m|thm
O|S_ldier|nt,thm
O|At_ne|thm
O|Arm_r|thm
O|S_rrow|ot,thm,east
O|L_ins|thm
O|Pr_w|obj
O|Zi_n|plc,psalm
O|Jeal_us|thm
O|Mahl_n|ot,ppl
P|Zip_orah|ot,ppl
P|Oyede_o|cur,ppl
P|Epi_hany|xmas
P|E_hraim|ot,ppl
P|Ap_le|obj
P|Sup_er|nt,thm,east
P|Disci_les|thm
P|Pro_hets|thm
P|Ja_heth|ot,ppl
P|Epa_hras|nt,ppl
P|She_herd|thm,psalm
P|Co_tic|cur
P|Pul_it|cur,obj
P|Pro_het|thm
P|Ho_hni|ot,ppl
Q|A_uila|nt,ppl
R|Fi_st|nt,thm
R|Powe_|pent
R|D_agon|thm
R|Sha_p|nt,thm
R|Ma_vel|thm
R|C_ib|nt,obj,xmas
R|Wo_m|nt,thm
R|F_uit|pent
R|Pastu_es|psalm
R|Endu_e|thm
R|Lo_ds|thm
R|Sc_oll|obj
R|Tho_n|nt,obj,east
R|P_ince|ot,thm,xmas
R|Afa_|thm
R|St_aw|ot,obj
R|Towe_s|obj
R|De_be|nt,plc
R|D_oss|ot,obj
R|Sh_ine|nt,obj
R|Sp_ing|thm
R|F_iend|ot,thm
R|Sc_ibe|thm
R|C_oss|thm,east
R|Cathed_al|cur,plc
R|Ea_th|thm
S|Cros_es|east
S|Choo_e|thm
S|Jake_|cur,ppl
S|Ea_ter|east
S|Nur_e|ot,thm
S|Penteco_t|pent
S|Peri_h|thm
S|La_t|nt,thm
S|For_ake|thm
S|Era_tus|nt,ppl
S|Bles_|thm
S|Ve_sel|nt,obj
S|Bles_ings|thm
S|Eli_ha|ot,ppl
S|Pa_tor|thm
S|Cru_ade|cur,thm
S|Manas_eh|ot,ppl
S|Bles_ing|thm
S|Wor_hip|thm
S|Cri_pus|nt,ppl
S|Who_o|thm
S|Me_hach|ot,ppl
S|A_tray|thm
S|Podca_t|cur,thm
S|Fig_|obj
S|Hou_e|nt,obj
T|Migh_|ot,thm
T|Grea_|nt,thm
T|S_aff|ot,obj,psalm
T|Scy_he|obj
T|Gian_|thm
T|A_hens|nt,plc
T|Oa_h|ot,thm
T|Vic_ory|thm
T|Fain_|thm
T|Oa_s|obj
T|Lys_ra|nt,plc
T|Al_ar|thm
T|Nazare_h|plc,xmas
T|Ket_le|obj
T|Be_hlehem|plc,xmas
T|Hit_ite|ot,ppl
T|Jus_ice|thm
T|Ba_tle|ot,thm
T|Lef_|thm
T|Roos_er|obj,east
T|Wor_h|thm
T|Migh_y|thm
T|Ba_he|thm
T|S_and|nt,thm
T|Or_hodox|cur
T|Keni_e|ot,ppl
U|Cher_b|thm,ot
U|Ref_ge|psalm
U|Virt_e|thm
U|Denari_s|obj
U|E_odia|nt,ppl
U|Jeh_|ot,ppl
U|T_tu|cur
U|R_by|obj
U|S_nday|east
U|Cla_dius|nt,ppl
U|J_das|nt,ppl,east
U|Ara_nah|ot,ppl
U|Plag_e|thm
U|Co_nsel|thm
U|Tri_mph|thm
U|C_bit|ot,obj
U|Yo_ng|nt,thm
U|Loc_st|thm
U|D_ty|ot,thm
U|M_rder|thm
U|Q_een|ot,ppl
U|J_lius|nt,ppl
U|Zacchae_s|nt,ppl
U|Eh_d|ot,ppl,hero
U|G_ilt|thm
U|Clo_d|obj
V|Da_id|ot,ppl,hero,psalm
V|Wea_e|thm
V|Le_i|ot,ppl
V|Le_iticus|bk
V|Ad_ent|xmas
V|Ele_ation|cur
V|Di_ide|thm
V|Twel_e|thm
V|Sho_el|obj
V|Do_es|obj
V|Oli_es|plc,east
V|Har_est|thm
W|S_ord|thm
W|Yah_eh|thm
W|Wido_|nt,thm
W|D_ell|ot,thm,psalm
W|Sho_er|obj
W|A_ake|thm
W|Good_ill|nt,thm,xmas
X|E_tol|thm,psalm
X|E_odus|bk
Y|Wear_|thm
Y|H_ssop|ot,obj
Y|Marr_|thm
Y|Mart_r|nt,thm
Y|On_cha|obj
Y|Empt_|thm
Y|Holl_|cur,obj,xmas
Y|Ferr_|obj
Y|Ab_ss|thm
Y|Tarr_|thm
Y|Env_|ot,thm
Y|Lowl_|thm
Y|C_prus|nt,plc
Y|Eg_pt|plc
Y|Fier_|thm
Y|Vine_ard|obj
Y|Merr_|ot,thm
Y|H_mn|thm
Z|Elea_ar|ot,ppl
Z|U_ziah|ot,ppl
Z|Be_alel|ot,ppl
Z|E_ekiel|ot,ppl
Z|Ad_e|obj
ADAMANT|Hard as stone, like Ezekiel's forehead|thm
ADOPTION|Becoming God's child|thm
ADULTERY|Breaking marriage vows|thm
ADVERSARY|Enemy, the devil|thm
ADVOCATE|Jesus pleads for us as one|thm
AMETHYST|Purple gem in the city wall|obj
ANCHORED|Held firm in hope|thm
ANISE|Tithed seasoning|obj
ANTLER|Part of the deer that pants|obj
APOSTASY|Falling away from the faith|thm
ARABIA|Land where Paul went after conversion|plc
ARCHER|Bow user|ot
ARMOUR|Spiritual protection|thm
ARRAY|Dress or arrange|thm
ASSURANCE|Confidence of faith|thm
ASSYRIA|Empire that captured Israel|plc
ATTIRE|Clothing|thm
AUTHOR|Maker, as of our faith|thm
BADGER|Skin used in tabernacle covering|obj
BAKER|Pharaoh's officer who was hanged|ot
BALDNESS|Elisha was mocked for it|ot
BARREN|Unable to bear children|thm
BEACON|Signal light|obj
BEARD|Facial hair of Aaron|obj
BEATITUDE|Blessing from the Sermon on the Mount|thm
BEDROOM|Where whispers are heard from the housetops|obj
BEETLE|Insect|obj
BEGGAR|Blind Bartimaeus was one|nt
BEHEAD|John the Baptist suffered this|nt
BELLY|Jonah's fish held him in its|ot
BELTS|Girdles|obj
BETROTH|Promise to marry|thm
BETROTHED|Engaged, like Mary to Joseph|xmas
BLASPHEME|Speak against God|thm
BLEATING|Sound of sheep|obj
BLINDED|Paul was for three days|nt
BLOSSOM|Aaron's rod did this|ot
BOASTING|Bragging|thm
BOOTH|Temporary shelter|obj
BORDER|Edge of a land|thm
BOUNTY|Generous gift|thm
BRAMBLE|Thorny bush in Jotham's parable|obj
BRASS|Metal in the tabernacle basin|obj
BREASTS|Nursing|thm
BREWER|Drink maker|thm
BRIDLE|Horse's headgear|obj
BRIMSTONE|Burning sulfur|thm
BRONZE|Serpent's metal|obj
BUCKLER|Small shield|obj
BUILDER|Wise man who built on rock|nt
BULRUSH|Moses' basket was made of it|ot
BURNT|Offering on the altar|thm
BUTTER|Dairy product|obj
CAESAREA|Port where Cornelius lived|plc
CAMP|Israel's wilderness tents|thm
CAPTIVE|Prisoner|thm
CAPTIVITY|Exile in Babylon|thm
CARCASS|Dead body|thm
CARRION|Dead flesh vultures eat|obj
CATTLE|Livestock|obj
CEASE|Stop|thm
CELEBRATE|Feast joyfully|thm
CELESTIAL|Of heaven|thm
CHAINS|Paul's bonds|nt
CHAMBER|Room|obj
CHARITY|Love|thm
CHASTEN|Discipline|thm
CHEERFUL|God loves a __ giver|thm
CHERUBIM|Angels over the ark|ot
CHESTNUT|Tree Jacob peeled sticks from|obj
CHIEF|Head|thm
CHILDREN|Let the little ones come|nt
CHISEL|Stone tool|obj
CIRCLE|Round shape|obj
CISTERN|Water pit, Joseph's prison|obj
CLAMOR|Noisy outcry|thm
CLEFT|Crack in the rock|obj
CLOUDS|Rain bringers|obj
COALS|Burning embers|obj
COBBLER|Shoemaker|thm
COCKCROW|Dawn when Peter denied|east
COMPANION|Friend|thm
CONCEIVE|Become pregnant|thm
CONDEMN|Judge guilty|thm
CONSOLE|Comfort|thm
CONTENT|Satisfied|thm
CONTRITE|Sorry for sin|thm
CONVERT|Change faith|thm
CORNER|Stone rejected becomes the __stone|thm
CORRUPT|Spoiled|thm
COUNCIL|Sanhedrin|nt
COURTYARD|Open area|obj
COWARD|Fearful one|thm
CRAFTSMAN|Skilled worker|thm
CREEPING|Moving low on the ground|thm
CRIMSON|Deep red, though sins be like scarlet|thm
CRIPPLE|Lame man at the Beautiful Gate|nt
CROWNED|Given a royal headdress|thm
CRUCIBLE|Furnace for refining|obj
CRUMBS|Fell from the master's table|nt
CRYSTAL|Clear sea before the throne|obj
CUCKOO|Unclean bird|obj
CUNNING|Crafty|thm
CURSED|Under a curse|thm
CUSTOM|Habit or tradition|thm
DAMSEL|Young girl|thm
DARKNESS|Plague of Egypt|thm
DAUGHTER|Jairus's little one|nt
DAYBREAK|Dawn|thm
DEADLY|Fatal|thm
DEBTOR|One who owes|thm
DECEIVE|Mislead|thm
DECLARE|Announce|thm
DEFILE|Make unclean|thm
DELIVER|Rescue|thm
DEMON|Evil spirit|nt
DENOUNCE|Condemn|thm
DEPART|Leave|thm
DESCEND|Come down, like the dove|thm
DESOLATE|Empty and lonely|thm
DESPAIR|Lose hope|thm
DESPISE|Look down on|thm
DESTROY|Wipe out|thm
DEVOTION|Dedication|thm
DEVOUR|Eat up|thm
DIADEM|Crown|obj
DIAMOND|Hard gem|obj
DIGNITY|Honor|thm
DILIGENT|Hard-working|thm
DISCERN|Judge rightly|thm
DISGRACE|Shame|thm
DISMAY|Alarm|thm
DISPERSE|Scatter|thm
DIVORCE|Legal ending of marriage|thm
DOCTRINE|Teaching|thm
DOMINION|Rule|thm
DOORPOST|Where the lamb's blood was put|ot
DOUBLE|Twofold|thm
DOVECOTE|Dove house|obj
DOWNCAST|Sad|psalm
DRAGNET|Fishing net|obj
DROUGHT|Dry season|thm
DROWN|Die in water|thm
DRUNKARD|Heavy drinker|thm
DUNGEON|Prison pit|obj
DWELLING|Home|thm
EARRING|Golden calf ornament|obj
EARTHEN|Made of clay|obj
EASTERN|From the East|thm
EDIFY|Build up|thm
EFFORT|Strain|thm
EGYPTIAN|Native of the Nile|ot
EIGHTH|Day of circumcision|ot
ELDERS|Church leaders|nt
ELEMENT|Basic part|thm
EMBRACE|Hug|thm
EMERALD|Green gem|obj
EMPEROR|Caesar|nt
ENCAMP|Set up tents|thm
ENCOURAGE|Give courage|thm
ENDLESS|Without end|thm
ENDURANCE|Lasting strength|thm
ENEMIES|Foes|thm
ENGRAVE|Carve|thm
ENLIGHTEN|Shed light on|thm
ENSIGN|Banner|obj
ENTRANCE|Way in|thm
ENVOY|Messenger|thm
EPISTLE|Letter in the New Testament|nt
ESTEEM|Value highly|thm
ETERNITY|Forever|thm
EUNUCH|Ethiopian official whom Philip baptized|nt
EVANGEL|Good news|thm
EVENING|End of the day|thm
EVERMORE|Forever|thm
EXALTED|Lifted high|thm
EXAMPLE|Pattern to follow|thm
EXCEL|Surpass|thm
EXHORT|Urge|thm
EXPANSE|Sky or firmament|thm
EXPIRE|Breathe one's last|thm
FACTION|Group causing division|thm
FALLOW|Unplowed ground|obj
FAMILY|Household|thm
FAREWELL|Goodbye|thm
FARMER|Tiller|thm
FASHION|Shape|thm
FATLING|Fattened calf|obj
FAVOR|Grace|thm
FEARFUL|Afraid|thm
FEATHER|Under His wings, covered with these|obj
FELLOW|Companion|thm
FERTILE|Fruitful|thm
FESTIVAL|Feast day|thm
FETTERS|Leg irons|obj
FEVER|Peter's mother-in-law had one|nt
FIDELITY|Faithfulness|thm
FIERCE|Violent|thm
FIFTH|Number after fourth|thm
FIFTY|Pentecost count|pent
FIGHTER|Warrior|thm
FILTHY|Dirty|thm
FIREPAN|Priest's tool|obj
FIRSTBORN|Eldest|ot
FISHER|Peter's old trade|nt
FISHERMEN|Peter and Andrew|nt
FLAGRANT|Obvious|thm
FLATTER|Praise falsely|thm
FLESHLY|Of the body|thm
FLOCKS|Shepherd's charges|obj
FLOODS|Great waters|thm
FLOURISH|Prosper|psalm
FOLLOWER|Disciple|nt
FOLLY|Foolishness|thm
FOOTSTOOL|Enemies made one|thm
FORBID|Not allow|thm
FOREHEAD|Brow|thm
FOREIGNER|Stranger|thm
FOREST|Wooded land|obj
FOREVER|Always|thm
FORGET|Not remember|thm
FORGIVEN|Pardoned|thm
FORMLESS|Without shape|thm
FORTIFY|Strengthen|thm
FORTUNE|Wealth|thm
FOURTH|Number after third|thm
FRAGRANT|Sweet-smelling|thm
FRAIL|Weak|thm
FREEDOM|Liberty|thm
FRIENDS|Greater love than laying down life for them|nt
FRUITFUL|Productive|thm
FULFILL|Complete|thm
FUNERAL|Burial rites|thm
GAINSAY|Contradict|thm
GALLOWS|Haman's tall structure|ot
GARRISON|Troops stationed|thm
GENEALOGY|Family tree|thm
GENEROUS|Giving freely|thm
GENTILE|Non-Jew|nt
GIVER|One who gives cheerfully|thm
GLEANER|Ruth gathering leftover grain|ot
GLITTER|Sparkle|thm
GLORIOUS|Full of splendor|thm
GLUTTONY|Excess in eating|thm
GOADS|Prods for oxen|obj
GODLESS|Without God|thm
GODLY|Devout|thm
GOVERNOR|Ruler of a province|nt
GRACEFUL|Elegant|thm
GRANARY|Grain store|obj
GRANDSON|Child of a child|thm
GRATITUDE|Thankfulness|thm
GREEDY|Selfish for gain|thm
GREETING|Salutation|thm
GRIEVE|Mourn|thm
GROVE|Trees planted by Abraham|obj
GUARDIAN|Protector|thm
GUESTROOM|Place of the Last Supper|east
HAGGARD|Worn out|thm
HALLOWED|Holy|thm
HANDMAID|Mary called herself the Lord's|xmas
HAPPY|Blessed|thm
HARBOR|Port|obj
HARDEN|Make stubborn|thm
HARLOT|Rahab's old label|ot
HARMONY|Agreement|thm
HASTEN|Hurry|thm
HAUGHTY|Proud|thm
HEADSTONE|Chief cornerstone|thm
HEALER|Jehovah Rapha|thm
HEALTH|Wellness|thm
HEARKEN|Listen|thm
HEARTH|Fireplace|obj
HEATHEN|Pagan|thm
HEAVENLY|Of the sky|thm
HEBREW|Jewish language|ot
HEIFER|Young cow|obj
HELPER|Holy Spirit's role|nt
HERALD|Messenger|xmas
HERITAGE|Inheritance|thm
HERMIT|Loner|thm
HIGHWAY|Road, prepare the way|thm
HILLSIDE|Slope of the mount|obj
HINDER|Block|thm
HIRELING|Hired shepherd who flees|nt
HOMELAND|Native country|thm
HOMEWARD|Toward home|thm
HONEYCOMB|Sweeter than this are the Lord's words|psalm
HOPEFUL|Expecting good|thm
HORIZON|Sky line|obj
HORSEMEN|Cavalry|obj
HOSTAGE|Captive held|thm
HOUSEHOLD|Family|thm
HUMILITY|Meekness|thm
HUNDRED|Sheep count in a parable|thm
HUNTER|Nimrod was a mighty one|ot
HURRICANE|Violent wind|thm
HYPOCRITE|One who pretends|nt
ICICLE|Frozen drip|obj
IDOLATRY|Worship of false gods|thm
IGNORANT|Unknowing|thm
ILLNESS|Sickness|thm
IMMORTAL|Never dying|thm
IMPART|Give|thm
IMPRISON|Put in jail|thm
INCARNATE|In human flesh|xmas
INCREASE|Grow|thm
INDEED|Truly|thm
INFANT|Baby|xmas
INFIRM|Weak|thm
INHERITOR|One who receives an estate|thm
INIQUITY|Sin|thm
INNKEEPER|Cared for the injured man|nt
INSIGHT|Understanding|thm
INSPIRE|Breathe into|thm
INSTRUCT|Teach|thm
INTEGRITY|Honest character|thm
INTERCEDE|Plead for another|thm
INTREAT|Plead|thm
INVITE|Ask to come|thm
ISLAND|Patmos|plc
ITINERANT|Traveling preacher|thm
JAILER|Philippian who asked how to be saved|nt
JASPER|Gem of the first wall foundation|obj
JEALOUSY|Envy|thm
JERKIN|Short coat|obj
JOURNEYED|Traveled|thm
JOYFUL|Glad|psalm
JUDGMENT|Decision|thm
JUNIPER|Tree where Elijah rested|ot
JUSTIFY|Declare righteous|thm
KEEPER|One who guards|thm
KIDNEYS|Organs in sacrifices|obj
KINDRED|Relatives|thm
KINSMAN|Boaz was a redeemer|ot
KNEELING|On bended knee|thm
KNOWLEDGE|Understanding|thm
LABORER|Worker in the vineyard|nt
LAMENT|Mourn|thm
LANDMARK|Boundary stone|thm
LATTER|Second of two|thm
LAUGHTER|Sarah's joy|ot
LAYMAN|Not clergy|thm
LEAVENED|Containing yeast|thm
LEGACY|Inheritance|thm
LEOPARD|Spotted cat|obj
LIBERTY|Freedom|thm
LIFETIME|Span of life|thm
LIGHTNING|Flash of heaven|thm
LINEAGE|Ancestry|thm
LIONESS|Female lion|obj
LISTEN|Hear|thm
LITTLE|Not much|thm
LIVING|Alive|thm
LOCUSTS|John the Baptist ate them|nt
LOOKING|Gazing|thm
LOWLAND|Valley|thm
LUKEWARM|Neither hot nor cold|nt
LULLABY|Sleep song|xmas
MAGICIAN|Egyptian sorcerer|ot
MAJESTY|Royal splendor|psalm
MANAGER|Steward|thm
MANSION|Large house in the Father's house|nt
MARRIAGE|Wedding bond|thm
MARVELOUS|Wonderful|thm
MATTER|Subject|thm
MEADOW|Pasture|obj
MEDIATOR|One between God and man|nt
MEDITATE|Think deeply on Scripture|psalm
MELODY|Tune|psalm
MEMORIAL|Remembrance|thm
MERCHANT|Trader|thm
MERCIFUL|Showing compassion|thm
MESSAGE|Word sent|thm
MESSENGER|One sent|thm
MIDNIGHT|Hour when Paul and Silas sang|nt
MIDWIFE|Shiphrah or Puah|ot
MILLSTONE|Heavy grinding wheel|nt
MINISTRY|Service|thm
MINSTREL|Musician|ot
MISERY|Suffering|thm
MOCKER|Scoffer|thm
MODEST|Humble|thm
MOMENT|Instant|thm
MONARCH|King|thm
MONTH|Moon cycle|thm
MORNING|Sunrise|thm
MORTAR|Pestle partner|obj
MOURNER|One who grieves|thm
MULTITUDE|Great crowd|nt
MURMUR|Complain softly|ot
MYSTERY|Hidden truth|thm
NATIONS|Peoples of the world|thm
NATIVE|Born there|thm
NATURE|Natural world|thm
NAZARENE|From Nazareth|nt
NEAREST|Closest|thm
NEEDY|Poor|thm
NEIGHBOUR|Good Samaritan's lesson|nt
NETWORK|Webwork of nets|obj
NEVERMORE|Never again|thm
NEWBORN|Baby|xmas
NIGHTFALL|Dusk|thm
NINTH|Hour of Jesus' death|east
NOBLEMAN|Man of rank|nt
NOURISH|Feed|thm
NUMBER|Count|thm
OBEDIENCE|Doing what is told|thm
OBSTINATE|Stubborn|thm
OFFENCE|Wrong|thm
OFFERINGS|Gifts at the altar|ot
OFFSPRING|Descendants|thm
OINTMENT|Mary poured it on Jesus' feet|nt
ONLOOKER|Spectator|thm
OPPRESS|Burden|thm
ORACLES|Sacred words|thm
ORCHARD|Fruit garden|obj
ORDINARY|Common|thm
OUTCAST|Rejected one|nt
OUTCRY|Loud protest|thm
OUTSIDE|Not inside|thm
OVERCOME|Conquer|thm
OVERFLOW|Spill over|psalm
OVERSEER|Bishop|nt
PALLET|Bed of the paralytic|nt
PARADISE|Where the thief joined Jesus|nt
PARALYZED|Unable to move|nt
PARCHMENT|Writing skin|obj
PARDON|Forgive|thm
PARENT|Mother or father|thm
PARTNER|Companion|thm
PASSION|Suffering of Christ|east
PASTURE|Grazing land|psalm
PATIENCE|Waiting calmly|thm
PATRIARCH|Father of a tribe|ot
PAVILION|Tent|obj
PEDDLE|Sell|thm
PENALTY|Punishment|thm
PENNY|Small coin|obj
PEOPLE|Nation|thm
PERFUME|Fragrance|obj
PERIL|Danger|thm
PERSECUTE|Harass for faith|thm
PERSEVERE|Keep going|thm
PETITION|Request|thm
PHYSICIAN|Doctor|nt
PIETY|Devotion|thm
PILGRIM|Traveler to a holy place|thm
PINNACLE|Temple top where Satan tempted|nt
PIONEER|Trailblazer|thm
PITCHER|Jar|obj
PLEDGE|Promise|thm
PLENTEOUS|Abundant|thm
PLOWMAN|Farmer|thm
PONDER|Think over|thm
PORTION|Share|thm
POSSESS|Own|thm
POSTERITY|Descendants|thm
POTSHERD|Broken clay piece|obj
POVERTY|Lack|thm
PRAYERFUL|Devoted to prayer|thm
PRECIOUS|Valuable|thm
PREPARE|Make ready|thm
PRESENCE|Being near|thm
PRESERVE|Keep safe|thm
PRISONER|Captive|thm
PROCLAIM|Announce|thm
PROFIT|Gain|thm
PROMISED|Pledged|thm
PROPHECY|Foretelling|thm
PROSPER|Succeed|thm
PROTECT|Guard|thm
PROUDLY|Boastfully|thm
PROVIDE|Supply|thm
PROVINCE|Region|nt
PRUDENT|Wise|thm
PUNISH|Chastise|thm
PURPLE|Lydia's cloth|nt
PURPOSE|Goal|thm
QUARREL|Argue|thm
QUENCH|Put out|thm
QUESTION|Query|thm
QUICKEN|Give life|thm
QUIETLY|Without noise|thm
RABBLE|Mob|thm
RADIANT|Shining|thm
RAFTER|Roof beam|obj
RANSOMED|Bought back|thm
RAPTURE|Joy or being caught up|thm
RAVENS|Fed Elijah|ot
REAPER|Harvester|thm
REASON|Think|thm
REBELLION|Revolt|thm
RECEIPT|Acceptance|thm
RECKON|Count|thm
RECONCILE|Bring back together|thm
RECORD|Write down|thm
RECOVER|Heal|thm
REDEEMED|Bought back|thm
REFINE|Purify|thm
REFRESH|Renew|thm
REFUSE|Decline|thm
REGION|Area|thm
REGISTER|Enroll for the census|xmas
REJECT|Cast off|thm
RELATIVE|Family member|thm
RELEASE|Set free|thm
RELIGION|Faith practice|thm
REMEMBER|Recall|thm
RENOWN|Fame|thm
RENT|Torn, like the veil|east
REPAIR|Mend|thm
REPORT|Account|thm
REPROACH|Disgrace|thm
REQUEST|Petition|thm
RESCUE|Save|thm
RESIST|Withstand the devil|thm
RESOLVE|Decide firmly|thm
RESPECT|Honor|thm
RESTORE|Give back|psalm
REVEAL|Make known|thm
REVENGE|Vengeance|thm
REVERENCE|Awe|thm
REVIVE|Bring back to life|psalm
REWARD|Prize|thm
RICHES|Wealth|thm
RIDDLE|Samson's wedding puzzle|ot
RIGHTEOUS|Just|thm
RIPPLE|Small wave|obj
RIVERS|Flowing waters|obj
ROBBER|Thief|nt
ROBES|Garments|obj
ROUGH|Not smooth|thm
RULER|Leader|thm
RUMOR|Hearsay|thm
RUNNER|One who races|thm
SACRED|Holy|thm
SACRIFICE|Offering|thm
SADNESS|Sorrow|thm
SAILOR|Seaman|thm
SALUTE|Greet|thm
SAMARITAN|Good neighbor in a parable|nt
SANCTIFY|Make holy|thm
SANCTUARY|Holy place|thm
SANDALS|Foot coverings|obj
SAPPHIRE|Blue gem|obj
SATISFY|Fill|thm
SCATTER|Disperse|thm
SCEPTRE|Royal rod|obj
SCHOLAR|Learned one|thm
SCORN|Despise|thm
SCORPION|Stinging creature|obj
SCRIPT|Writing|thm
SEAFARER|Sailor|thm
SEARCH|Look carefully|thm
SEASONS|Times of the year|thm
SECRET|Hidden|thm
SECURE|Safe|thm
SEDUCE|Lead astray|thm
SEEDTIME|Planting season|thm
SELFLESS|Unselfish|thm
SENATOR|Council member|thm
SENTENCE|Judgment|thm
SEPULCHRE|Tomb|east
SERENE|Calm|thm
SERVICE|Ministry|thm
SEVENTH|Day of rest|thm
SHAKEN|Unsettled|thm
SHALLOW|Not deep|thm
SHAPELESS|Formless|thm
SHEEPFOLD|Pen for the flock|nt
SHELTER|Protection|psalm
SHIPWRECK|Paul's Malta mishap|nt
SHOULDER|Government will be upon his|xmas
SHRUB|Bush|obj
SIBLING|Brother or sister|thm
SICKLY|Often ill|thm
SIGNET|Seal ring|obj
SILENCE|Quiet|thm
SIMPLE|Plain|thm
SINCERE|Honest|thm
SINFUL|Wicked|thm
SIXTH|Hour when darkness came|east
SKILFUL|Expert|thm
SLANDER|False talk|thm
SLAUGHTER|Kill|thm
SLAVERY|Bondage|thm
SLEEPER|Eutychus|nt
SLIPPERY|Hard to stand on|psalm
SLOTH|Laziness|thm
SLUMBER|Sleep|thm
SMITH|Metal worker|thm
SNARE|Trap|psalm
SOLEMN|Serious|thm
SOLITARY|Alone|thm
SOMEONE|A person|thm
SORCERER|Magician|nt
SORROWFUL|Grieving|thm
SOVEREIGN|Supreme ruler|thm
SPARROWS|Two sold for a penny|nt
SPEAKER|Orator|thm
SPECTACLE|Public sight|thm
SPINDLE|Spinning tool|obj
SPIRITUAL|Of the soul|thm
SPLENDOR|Magnificence|psalm
SPLINTER|Sliver of wood|obj
SPOKEN|Said aloud|thm
SPONGE|Offered vinegar to Jesus|east
SPRINKLE|Scatter drops|thm
STAIRS|Steps|obj
STALK|Stem|obj
STAMMER|Speak haltingly|thm
STARLIGHT|Light of the heavens|xmas
STATURE|Height|nt
STATUTE|Law|thm
STEADFAST|Firm|thm
STEWARD|Manager|nt
STINGY|Not generous|thm
STOMACH|Belly|thm
STONES|Rocks|obj
STRANGER|Unknown guest|nt
STREET|Road|thm
STRIPES|By His we are healed|east
STRUGGLE|Wrestle|thm
STUBBORN|Hard-headed|thm
STUDENT|Disciple|thm
SUBMIT|Yield|thm
SUBSTANCE|Matter|thm
SUCCESS|Prosperity|thm
SUCKLING|Nursing child|thm
SUFFERING|Pain|thm
SUMMON|Call|thm
SUNRISE|Dawn|thm
SUNSET|Dusk|thm
SURETY|Guarantee|thm
SURRENDER|Give up|thm
SURVIVE|Live through|thm
SWALLOW|Bird that nests near the altar|psalm
SYCAMORE|Tree Zacchaeus climbed|nt
SYMBOL|Sign|thm
SYNAGOGUE|Jewish place of worship|nt
TEACHER|Rabbi|nt
TEACHING|Instruction|thm
TEMPEST|Violent storm|thm
TEMPLES|Holy buildings|thm
TEMPTER|Satan|nt
TENDER|Gentle|thm
TENTMAKER|Paul's trade|nt
TERRIBLE|Awesome|thm
TESTAMENT|Covenant|thm
TESTIFY|Bear witness|thm
THANKFUL|Grateful|thm
THEATER|Place Paul was begged not to enter|nt
THIRTY|Pieces of silver|east
THIRSTY|Needing a drink|nt
THISTLE|Thorny weed|obj
THRESH|Beat out grain|ot
THRONES|Seats of kings|thm
THUNDERED|Roared|thm
TIDINGS|Good news|xmas
TIMBER|Wood|obj
TOGETHER|United|thm
TOMORROW|Next day|thm
TORMENT|Anguish|thm
TOWNSHIP|Small place|plc
TRADITION|Handed down custom|thm
TRAGEDY|Disaster|thm
TRANQUIL|Peaceful|thm
TRANSFORM|Change|thm
TRAVAIL|Painful labor|thm
TRAVELER|Wayfarer|thm
TREACHERY|Betrayal|thm
TREMBLING|Shaking|thm
TRESPASS|Sin against|thm
TRIBUNAL|Court|thm
TRUMPETS|Horns of Jericho|ot
TUMULT|Uproar|thm
TWILIGHT|Dusk|thm
TWINKLE|Sparkle|xmas
UNBELIEF|Lack of faith|thm
UNCLEAN|Impure|thm
UNFAILING|Never ending|thm
UNGODLY|Wicked|thm
UNHOLY|Not sacred|thm
UNITED|Joined|thm
UNKNOWN|God of Athens' altar|nt
UNSEEN|Invisible|thm
UNWORTHY|Not deserving|thm
UPPERROOM|Place of the Last Supper|east
UPRISING|Revolt|thm
UTTERANCE|Speech|pent
VAGABOND|Wanderer|ot
VANITY|Emptiness|thm
VANQUISH|Defeat|thm
VAPOUR|Mist|thm
VENGEANCE|Revenge|thm
VENOM|Poison|thm
VERDICT|Decision|thm
VESTURE|Clothing|thm
VICTOR|Winner|thm
VIGOR|Strength|thm
VILLAGER|Country dweller|thm
VIRGINS|Wise and foolish ones|nt
VISIBLE|Seen|thm
VISITOR|Guest|thm
VOYAGE|Sea journey|nt
VULTURE|Carrion bird|obj
WAGON|Cart|obj
WAILING|Loud grief|thm
WAITING|Expecting|thm
WANDERER|Roamer|thm
WARFARE|Combat|thm
WARRIOR|Fighter|ot
WASHING|Cleansing|thm
WATCHMAN|Guard on the wall|ot
WATERFALL|Cascade|obj
WAYFARER|Traveler|thm
WAYSIDE|Roadside where seed fell|nt
WEAKNESS|Frailty|thm
WEALTHY|Rich|thm
WEAPONS|Arms|obj
WEARINESS|Tiredness|thm
WEEPING|Crying|thm
WHIRLWIND|Elijah's heavenly ride|ot
WHISTLE|Shrill sound|thm
WHOLESOME|Healthy|thm
WIDOWS|Women to care for|nt
WILLING|Ready|thm
WILLOW|Tree where harps were hung|ot
WINDOW|Opening, like Paul's escape|nt
WINEPRESS|Where grapes are crushed|ot
WINESKIN|Old one bursts with new wine|nt
WINGED|Having wings|thm
WINNER|Victor|thm
WITHERED|Dried up|nt
WITNESSES|Those who testify|nt
WOMANHOOD|Female adulthood|thm
WONDERFUL|Counselor, Mighty God|xmas
WORKMAN|Laborer|nt
WORKSHOP|Carpenter's place|nt
WORSHIPER|One who adores|thm
WORTHY|Deserving|thm
WOUNDED|Hurt|thm
WRESTLE|Grapple like Jacob|ot
WRITTEN|Inscribed|thm
YEARNING|Longing|thm
YESTERDAY|Jesus Christ is the same __, today and forever|nt
YIELDED|Gave way|thm
YOUTHFUL|Young|thm
ZEALOT|Simon's party|nt
ZEALOUS|Passionate|thm
OMRI|King who built Samaria|ot,ppl
UZZAH|Touched the ark and died|ot,ppl
ZIBA|Servant of Mephibosheth|ot,ppl
ZERAH|Twin of Perez|ot,ppl
ZIMRI|King for only seven days|ot,ppl
ABIHU|Aaron's son who died with Nadab|ot,ppl
SARAI|Sarah's earlier name|ot,ppl
SALOME|Mother of James and John in Mark's gospel|nt,ppl
DAGON|Philistine fish god|ot,thm
RIMMON|Syrian god Naaman bowed to|ot,thm
MAMMON|Money as a master|nt,thm
BELIAL|Worthless one|ot,thm
JASON|Hosted Paul in Thessalonica|nt,ppl
JABBOK|River where Jacob wrestled|ot,plc
SYCHAR|Samaritan town with Jacob's well|nt,plc
SHUNEM|Town of the woman who built a room for Elisha|ot,plc
TROAS|Port of Paul's Macedonian vision|nt,plc
SHARON|Valley with a rose|ot,plc
EKRON|Philistine city that sent the ark back|ot,plc
TABOR|Mountain where Barak gathered his army|ot,plc
GILBOA|Mountain where Saul died|ot,plc
BEGET|Father a child|thm
MINA|Money in a parable of ten servants|cur
PURIM|Feast of lots|ot,thm
ACACIA|Wood of the ark|obj
TARES|Weeds among the wheat|obj
BRIER|Thorny plant|obj
ASP|Venomous snake|obj
ADDER|Serpent|obj
STORK|Knows her appointed times|obj
ROE|Gazelle|obj
HART|Deer longing for water|obj,psalm
HIND|Female deer|obj
APE|Animal imported by Solomon|obj
BEAR|Beast David fought off|obj
ANT|Sluggard's teacher|obj
ACHE|Dull pain|thm
ACRE|Land measure|thm
AIDE|Helper|thm
AIRY|Light and breezy|thm
AREA|Region|thm
ARID|Dry like the desert|thm
ATOP|On the summit of|thm
AUNT|Parent's sister|thm
AVID|Eager|thm
AWAY|Not here|thm
AXLE|Wheel's shaft|obj
BAIL|Scoop water from a boat|thm
BAIT|Lure for a fisher|obj
BAKE|Make bread|thm
BALD|Elisha was called this|ot,thm
BANK|River's edge|thm
BARE|Uncovered|thm
BARK|Tree's outer layer|obj
BASE|Foundation|thm
BASK|Lie in the sun|thm
BEAD|Small ornament|obj
BEAN|Lentil's cousin|obj
BEAT|Strike|thm
BEEF|Fatted calf's meat|obj
BELT|Girdle|obj
BEND|Bow down|thm
BEST|Finest|thm
BITE|Use the teeth|thm
BLOW|Sound a trumpet|thm
BLUE|Colour of the tabernacle's thread|obj
BOAR|Wild pig|obj
BOIL|Skin sore of Job|ot,thm
BOND|Chain|thm
BONE|Part of a skeleton|obj
BRAG|Boast|thm
BRED|Raised|thm
BREW|Prepare tea or ale|thm
BRIM|Edge of a cup|obj
BROW|Forehead|obj
BUCK|Male deer|obj
BUDS|Aaron's rod produced these|ot,obj
BULK|Great size|thm
BURY|Lay in a tomb|thm
BUSY|Occupied|thm
CART|Wagon|obj
CASE|Lawyer's matter|thm
CASH|Ready money|thm
CHAT|Talk casually|thm
CHIN|Part of the face|obj
CHIP|Small piece|obj
CITY|Large town|thm
CLAD|Dressed|thm
CLAN|Family group|thm
CLAP|Hands do this in praise|psalm,thm
CLAW|Eagle's talon|obj
CLIP|Trim shears do this|thm
CLUB|Weapon of the mob that arrested Jesus|nt,obj
COIL|Wind in loops|thm
COLD|Without warmth|thm
COMB|Honey's wax structure|obj
CONE|Pine's seed case|obj
COOK|Prepare a meal|thm
COOL|Slightly cold|thm
COPE|Handle a difficulty|thm
CORD|Triple strand not quickly broken|ot,obj
CORE|Centre|thm
COST|What it takes to follow, counted first|nt,thm
COZY|Snug|thm
CRAB|Sideways walker|obj
CREW|Ship's company|thm
CURE|Heal|thm
CURL|Twist into a ringlet|thm
DAMP|Slightly wet|thm
DARE|Be bold enough|thm
DART|Fiery one is stopped by the shield of faith|nt,obj
DASH|Run quickly|thm
DAYS|Twenty-four hours each|thm
DEAL|Trade|thm
DEAR|Beloved|thm
DESK|Scribe's table|obj
DIAL|Sundial face|obj
DICE|Soldiers cast lots with these, perhaps|obj
DIET|Daniel's vegetable meal plan|ot,thm
DIRT|Soil|thm
DISH|Plate|obj
DIVE|Plunge|thm
DOCK|Harbour platform|obj
DOME|Rounded roof|obj
DOSE|Measured medicine|thm
DRAG|Pull along|thm
DRAW|Pull up water|thm
DREW|Pulled water from the well|thm
DRIP|Fall in drops|thm
DROP|Small bead of liquid|thm
DRUM|Percussion instrument|obj
DUAL|Double|thm
DUCK|Water bird|obj
DUEL|Fight between two|thm
DUNE|Sandy hill|thm
DUSK|Twilight|thm
EARL|Noble rank|thm
EARN|Be paid for work|thm
EASE|Comfort|thm
EASY|Yoke that is this|nt,thm
EMIT|Give off|thm
EPIC|Grand story|thm
EXAM|Test|thm
EXIT|Way out|thm
FACE|What Moses' shone with glory|ot,thm
FACT|Truth|thm
FAKE|False|thm
FARE|Price of a passage|thm
FARM|Cultivate land|thm
FATE|Destiny|thm
FEEL|Touch|thm
FELL|Walls of Jericho did this|ot,thm
FELT|Thick cloth|obj
FERN|Plant with fronds|obj
FILE|Smooth with a tool|obj
FILL|Make full|thm
FILM|Thin coating|thm
FINE|Excellent|thm
FIST|Clenched hand|obj
FLAG|Banner|obj
FLAT|Level|thm
FLED|Ran away|thm
FLEW|Moved through air|thm
FLIP|Toss over|thm
FLOW|Run like a river|thm
FOAM|Froth|thm
FOLK|People|thm
FOND|Loving|thm
FORK|Winnowing tool|obj
FORM|Shape|thm
FOUL|Unclean|thm
FOUR|Gospel count|thm
FUEL|Wood for the fire|thm
FUND|Money set aside|thm
GAIN|Profit|thm
GALE|Strong wind on the lake|nt,thm
GAME|Hunter's catch|thm
GEAR|Equipment|thm
GIRL|Jairus's daughter was one|nt,ppl
GLOW|Soft shine|thm
GLUE|Stick together|obj
GOAL|Target|thm
GOES|Travels|thm
GONE|Departed|thm
GRAB|Seize|thm
GRAY|Colour of the hair of the aged|thm
GREW|Became larger|thm
GRID|Pattern of squares|thm
GRIM|Stern|thm
GRIN|Wide smile|thm
GRIP|Hold tightly|thm
GULF|Wide chasm between Lazarus and the rich man|nt,thm
GUST|Sudden wind|thm
HALF|One of two equal parts|thm
HALL|Large room|obj
HALT|Stop|thm
HAUL|Drag a heavy catch|thm
HEAP|Pile|thm
HEAT|Warmth|thm
HEEL|Serpent bruised it|ot,obj
HELD|Gripped|thm
HINT|Slight clue|thm
HOLE|Opening|thm
HOOD|Head covering|obj
HUGE|Enormous|thm
HUNG|Suspended|thm
HUNT|Pursue game|thm
HUSH|Be quiet|thm
IDEA|Thought|thm
INCH|Small measure of length|thm
ITEM|Single thing|thm
JARS|Water containers at Cana|nt,obj
JAWS|Donkey's was Samson's weapon|ot,obj
JOIN|Unite|thm
JOKE|Funny remark|thm
JUMP|Leap|thm
JURY|Panel of judges in a trial|thm
KEEN|Sharp|thm
KICK|Strike with the foot, like pricks|nt,thm
KNEW|Understood|thm
KNIT|Join with yarn|thm
KNOB|Door handle|obj
LACE|Delicate fabric|obj
LADY|Woman of rank|thm
LAID|Placed in a manger|xmas,thm
LAKE|Sea of Galilee, in Luke|nt,plc
LANE|Narrow street|thm
LARK|Songbird|obj
LASH|Stripe from a whip|thm
LAWN|Mown grass|obj
LAZY|Idle|thm
LEAK|Slow drip|thm
LENS|Part of the eye or glasses|obj
LESS|Not as much|thm
LIED|Spoke falsely|thm
LIME|Citrus fruit|obj
LINK|Chain part|obj
LIST|Series of names|thm
LOAD|Burden|thm
LONE|Solitary|thm
LOOM|Weaver's frame|obj
LOOP|Ring of cord|obj
LOSS|Opposite of gain|thm
LUCK|Chance|thm
LUMP|Bulge|thm
LUNG|Breathing organ|obj
LURE|Entice|thm
LUSH|Green and thick|thm
MAIL|Armour of chain links|obj
MAIN|Chief|thm
MASK|Face cover|obj
MASS|Large amount|thm
MATE|Companion|thm
MEAN|Signify|thm
MERE|Nothing more than|thm
MESH|Net weave|obj
MILD|Gentle|thm
MINE|Belonging to me|thm
MISS|Fail to hit|thm
MODE|Manner|thm
MOOD|Feeling|thm
MOVE|Shift|thm
MYTH|Old legend|thm
NAVY|Dark blue|thm
NEAT|Tidy|thm
NECK|Head's support|obj
NEWS|Good tidings|thm
NICE|Pleasant|thm
NODE|Joint|thm
NONE|Not one|thm
NORM|Standard|thm
NOTE|Brief letter|thm
NOUN|Part of speech|thm
ODDS|Chances|thm
OILY|Slick|thm
OKAY|Fine|thm
ORAL|Spoken|thm
OVAL|Egg shape|thm
PACE|Step|thm
PACK|Bundle|thm
PAGE|Leaf of a book|thm
PAID|Settled the bill|thm
PAIL|Bucket|obj
PAIR|Two together|thm
PARK|Public garden|plc
PART|Piece|thm
PAST|Gone by|thm
PAWN|Chess piece|obj
PEAR|Fruit tree|obj
PEEL|Strip the skin|thm
PEER|Look closely|thm
PEST|Plague|thm
PICK|Choose|thm
PIER|Landing place|obj
PILE|Heap|thm
PILL|Tablet|obj
PINE|Evergreen tree|obj
PINK|Pale red|thm
PLAY|Make music, like David on the harp|ot,thm
PLEA|Earnest request|thm
PLOT|Scheme|thm
PLUG|Stopper|obj
PLUS|Added to|thm
POEM|Verse|thm
POET|Writer of verse|thm
POLE|Brazen serpent was set on one|ot,obj
POLL|Vote count|thm
POND|Small pool|plc
PONY|Small horse|obj
POSE|Hold a position|thm
POST|Position of duty|thm
PREY|Hunted animal|thm
PULL|Draw towards|thm
PUMP|Machine for water|obj
PUSH|Shove|thm
QUIT|Give up|thm
QUIZ|Short test|thm
RACE|Run, as the saints are told to with patience|nt,thm
RACK|Torture frame|obj
RAFT|Floating platform|obj
RAGE|Fury|thm
RAID|Surprise attack|thm
RAIL|Fence bar|obj
RAKE|Garden tool|obj
RAMP|Slope|obj
RANG|Sounded, like a bell|thm
RANK|Position|thm
RARE|Uncommon|thm
RASH|Hasty|thm
RATE|Speed|thm
REAR|Back|thm
RELY|Depend|thm
RICE|Grain of Asia|obj
RIDE|Travel on a donkey|thm
RIOT|Wild uproar|thm
RISK|Danger|thm
RODE|Sat on a donkey|thm
ROLE|Part played|thm
ROLL|Stone moved from the tomb|east,thm
ROSY|Pink|thm
RUDE|Impolite|thm
RUIN|Destroy|thm
SAGE|Wise man|thm
SALE|Exchange for money|thm
SANG|Praised in song|thm
SEEM|Appear|thm
SELF|One's own person|thm
SENT|Dispatched|thm
SHOP|Place of trade|plc
SHOT|Fired an arrow|thm
SHOW|Display|thm
SIDE|Edge|thm
SIGH|Deep breath of sorrow|thm
SITE|Location|thm
SIZE|Dimensions|thm
SKIP|Leap about|thm
SLAB|Flat stone|obj
SLID|Moved smoothly|thm
SLIM|Thin|thm
SLIP|Stumble|thm
SOAK|Drench|thm
SORT|Kind|thm
SOUP|Esau's red pottage|ot,obj
SOUR|Bitter in taste|thm
SPIN|Twist thread|thm
SPOT|Stain or blemish|thm
STEM|Plant's stalk|obj
STOP|Halt|thm
SUIT|Be fitting|thm
SUNG|Past tense of praise|thm
SWAM|Moved through water|thm
SWAN|White bird|obj
SWAY|Rock from side to side|thm
SWIM|Move through water|thm
TAIL|Animal's rear|obj
TALL|Zacchaeus was not|nt,thm
TANK|Water container|obj
TAPE|Sticky strip|obj
TASK|Assignment|thm
TEAM|Yoked animals|thm
TERM|Period of time|thm
TEXT|Scripture passage for a sermon|thm
TIDY|Orderly|thm
TIED|Bound|thm
TILE|Roof piece|obj
TILL|Plough|thm
TINY|Mustard seed size|nt,thm
TIRE|Grow weary|thm
TOLL|Tax for a road|thm
TONE|Sound quality|thm
TOOL|Implement|obj
TRIM|Cut neatly|thm
TRIP|Journey|thm
TUBE|Pipe|obj
TUNE|Melody|thm
UNIT|Single item|thm
URGE|Strongly encourage|thm
USED|Employed|thm
USER|One who employs|thm
VARY|Change|thm
VEIN|Blood vessel|obj
VERB|Word of action|thm
VEST|Sleeveless garment|obj
VIEW|Look at|thm
VOTE|Cast a ballot|thm
WADE|Walk through shallow water|thm
WAND|Magician's stick|obj
WAYS|Paths|thm
WEAR|Be clothed in|thm
WEPT|Shed tears, like Jesus at Lazarus' tomb|nt,thm
WIDE|Broad is the gate|nt,thm
WIRE|Thin metal strand|obj
WOKE|Stirred from sleep|thm
WORE|Had on, like a robe|thm
WORN|Used much|thm
WRAP|Enfold in cloth|thm
YARD|Enclosed court|plc
YARN|Wool thread|obj
ZERO|Nothing|thm
ACTOR|Stage performer|thm
ADAPT|Adjust to new conditions|thm
ADMIT|Confess|thm
ADOPT|Take as one's own child|nt,thm
ADULT|Grown-up|thm
AGENT|Representative|thm
AGREE|Be of one mind|thm
AHEAD|In front|thm
ALARM|Warning sound|thm
ALERT|Watchful|thm
ALIKE|Similar|thm
ALLOW|Permit|thm
ALTER|Change|thm
AMAZE|Astonish|thm
ANGLE|Fish with a hook|thm
ANKLE|Foot joint|obj
APART|Separated|thm
APPLY|Put to use|thm
ARGUE|Dispute|thm
AROMA|Pleasing scent|thm
ASIDE|To one side|thm
ASSET|Valuable possession|thm
AVOID|Shun evil|thm
AWARD|Prize|thm
AWARE|Conscious of|thm
BASIC|Fundamental|thm
BASIS|Foundation|thm
BEACH|Sandy shore of the sea|plc
BEGIN|In the ___ was the Word|nt,thm
BEING|Living creature|thm
BENCH|Seat for many|obj
BERRY|Small juicy fruit|obj
BLACK|Colour of night|thm
BLADE|Sword's edge|obj
BLAZE|Bright fire|thm
BLEND|Mix together|thm
BLOCK|Obstacle|thm
BOARD|Ship's deck plank|thm
BOAST|Brag|thm
BONUS|Extra reward|thm
BRAIN|Organ of thought|obj
BRAKE|Stopping device|obj
BRAND|Mark with a hot iron|thm
BRAVE|Courageous like David|thm
BREED|Raise animals|thm
BRIEF|Short|thm
BRING|Carry here|thm
BROAD|Wide|thm
BROOM|Sweeping tool|obj
BROWN|Earthy colour|thm
BRUSH|Painter's tool|obj
BUILD|Raise a temple|thm
BUNCH|Cluster of grapes|obj
BURST|Break open|thm
BUYER|Merchant's customer|thm
CABIN|Small hut|obj
CABLE|Strong rope|obj
CANAL|Man-made waterway|plc
CARRY|Bear a cross|thm
CARVE|Cut an image|thm
CATCH|Haul in fish|thm
CAUSE|Reason|thm
CHAIR|Seat|obj
CHALK|White limestone|obj
CHARM|Attractiveness|thm
CHART|Map of the sea|obj
CHASE|Pursue|thm
CHEAP|Low in price|thm
CHEAT|Deceive|thm
CHECK|Examine|thm
CHEST|Ark of the covenant, in a way|obj
CHILL|Cold|thm
CHORD|Notes played together|thm
CIVIC|Of a city|thm
CLAIM|Assert|thm
CLASS|Group of students|thm
CLERK|Town recorder in Ephesus|nt,ppl
CLIFF|Steep rock face|plc
CLIMB|Ascend, like Zacchaeus up a tree|nt,thm
CLOCK|Timekeeper|obj
CLOSE|Shut|thm
COACH|Teacher of athletes|thm
COAST|Land by the sea|plc
COUCH|Bed Jesus told the paralytic to carry|nt,obj
COUGH|Throat reflex|thm
CRACK|Split open|thm
CRANE|Long-legged bird|obj
CRASH|Fall with noise|thm
CRAZY|Mad|thm
CREAM|Top of the milk|obj
CRIME|Offence|thm
CROWD|Throng that followed Jesus|nt,thm
CURVE|Bend|thm
CYCLE|Repeating series|thm
DAILY|Bread we ask for each day|nt,thm
DAIRY|Milk products|thm
DELAY|Put off|thm
DEPTH|Deep end|thm
DIARY|Daily record|obj
DIRTY|Unclean|thm
DOZEN|Twelve|thm
DRAFT|Rough version|thm
DRAIN|Empty out|thm
DRAMA|Play|thm
DRANK|Sipped from the cup|thm
DRAWN|Pulled, like water|thm
DRIED|Free of moisture|thm
DRIFT|Be carried by a current|thm
DRIVE|Urge animals onward|thm
EAGER|Keen|thm
EIGHT|Number saved in the ark|ot,thm
ELBOW|Arm joint|obj
ENJOY|Take pleasure in|thm
ENTRY|Way in|thm
EQUAL|Same in value|thm
EVENT|Happening|thm
EXACT|Precise|thm
EXIST|Be|thm
EXTRA|More than needed|thm
FABLE|Story with a moral|thm
FAIRY|Imaginary sprite|thm
FANCY|Elaborate|thm
FATAL|Deadly|thm
FENCE|Barrier around a field|obj
FINAL|Last|thm
FLASH|Sudden light|thm
FLEET|Group of ships|thm
FLOAT|Rest on water|thm
FLUID|Liquid|thm
FOCUS|Concentrate|thm
FORTY|Days of the flood rain|ot,thm
FRAME|Support structure|obj
FRANK|Honest|thm
FRAUD|Deceit|thm
FRESH|New|thm
FRONT|Forward part|thm
FROST|Ice crystals|thm
FUNNY|Amusing|thm
GIVEN|Offered freely|thm
GLASS|We see through it darkly|nt,obj
GLOBE|Round earth|thm
GLOOM|Darkness|thm
GOOSE|Large water bird|obj
GRAND|Great|thm
GRANT|Bestow|thm
GRASP|Take hold of|thm
GROUP|Gathering|thm
GROWN|Matured|thm
GUESS|Estimate|thm
HABIT|Regular practice|thm
HARSH|Severe|thm
HEDGE|Bush barrier|obj
HOTEL|Inn, to travellers|plc
HUMAN|Of mankind|thm
HUMOR|Comedy|thm
HURRY|Haste|thm
IDEAL|Perfect|thm
INDEX|Pointer finger|obj
INNER|Inside|thm
INPUT|Contribution|thm
IRONY|Opposite meaning|thm
ISSUE|Flow out|thm
JOINT|Body connection|obj
JUICE|Fruit liquid|obj
LARGE|Big|thm
LATER|After a time|thm
LAYER|One level|thm
LEARN|Study|thm
LEASE|Rent out land|thm
LEAST|Smallest|thm
LEAVE|Depart|thm
LEGAL|Lawful|thm
LEMON|Sour fruit|obj
LEVEL|Even|thm
LIMIT|Boundary|thm
LIVER|Organ consulted by Babylon's king|ot,obj
LOCAL|Nearby|thm
LODGE|Stay overnight|thm
LOVER|Beloved in the Song of Songs|ot,thm
LOWER|Bring down|thm
LOYAL|Faithful|thm
LUCKY|Fortunate|thm
LUNCH|Midday meal|thm
MAGIC|Sorcery|thm
MANOR|Large estate|plc
MAPLE|Syrup tree|obj
MATCH|Equal|thm
MAYBE|Perhaps|thm
MAYOR|City leader|thm
MEANT|Intended, as evil but God ___ it for good|ot,thm
MEDAL|Award|obj
METAL|Iron or bronze|obj
MINOR|Lesser|thm
MIXED|Blended|thm
MODEL|Example to follow|thm
MORAL|Ethical|thm
MOUSE|Small rodent|obj
MUSIC|Harp and psalm|thm
NASTY|Unpleasant|thm
NERVE|Courage|thm
NEWLY|Recently|thm
NOTED|Well known|thm
OCCUR|Happen|thm
OCEAN|Great sea|plc
ORDER|Command|thm
OUTER|External|thm
OWNER|Possessor|thm
PAINT|Colour a wall|obj
PANEL|Section of wall|obj
PAPER|Writing sheet|obj
PASTE|Stick together|obj
PATCH|Piece of cloth sewn on|nt,obj
PEACH|Juicy fruit|obj
PHASE|Stage|thm
PILOT|Ship's steersman|thm
PLACE|Position|thm
PLANE|Carpenter's smoothing tool|obj
PLATE|Dish|obj
POINT|Tip|thm
POUND|Strike heavily|thm
PRICE|Cost of the pearl|nt,thm
PRIME|First in rank|thm
PRINT|Mark of the nails|nt,thm
PRIOR|Earlier|thm
PRIZE|Reward|thm
PROOF|Evidence|thm
PUPIL|Student or part of the eye|thm
QUEST|Search|thm
QUOTE|Cite words|thm
RANGE|Row of mountains|thm
RATIO|Proportion|thm
READY|Prepared|thm
REFER|Mention|thm
RELAX|Rest|thm
REPLY|Answer|thm
RIDER|Man on a horse|thm
RIDGE|Hill crest|plc
RIFLE|Search through|thm
RIGID|Stiff|thm
RIVAL|Competitor|thm
ROAST|Cook over a fire|thm
ROBIN|Red-breasted bird|obj
ROCKY|Stony|thm
ROUTE|Way to travel|thm
RURAL|Of the country|thm
SADLY|With sorrow|thm
SAUCE|Dish topping|obj
SCARE|Frighten|thm
SCENE|View|thm
SCOPE|Range|thm
SCORE|Twenty, as in three ___ and ten|psalm,thm
SENSE|Perceive|thm
SHAKE|Tremble|thm
SHAPE|Form|thm
SHEET|Linen cloth|obj
SHELF|Narrow ledge|obj
SHIFT|Change position|thm
SHIRT|Garment|obj
SHOCK|Sudden fright|thm
SHORT|Not long|thm
SIXTY|Number in the Song of Songs' mighty men|ot,thm
SKILL|Ability|thm
SKIRT|Hem of a garment|thm
SLICE|Cut a thin piece|thm
SLIDE|Glide|thm
SLOPE|Hillside|plc
SMART|Clever|thm
SMELL|Scent|thm
SMILE|Happy look|thm
SOLID|Firm|thm
SOLVE|Work out|thm
SORRY|Regretful|thm
SPACE|Room|thm
SPARK|Tiny fire|thm
SPEED|Swiftness|thm
SPELL|Enchantment|thm
SPEND|Pay out|thm
SPILL|Pour out accidentally|thm
SPINE|Backbone|obj
SPLIT|Divide|thm
SPOIL|Plunder|thm
SPOON|Eating utensil|obj
SPORT|Game|thm
SPRAY|Fine mist|thm
STACK|Heap|thm
STAGE|Platform|thm
STAIN|Spot|thm
STAKE|Tent peg|obj
STAMP|Press down firmly|thm
STARE|Gaze|thm
START|Begin|thm
STATE|Declare|thm
STEAM|Water vapour|thm
STEEL|Strong metal|obj
STEEP|Sharply sloped|thm
STEER|Guide a ship|thm
STIFF|Rigid|thm
STOOD|Rose to one's feet|thm
STORY|Parable|thm
STRIP|Take off|thm
STUCK|Fixed fast|thm
STUDY|Examine the Scriptures|thm
STUFF|Fill|thm
STYLE|Fashion|thm
SUITE|Set of rooms|thm
SUNNY|Bright with light|thm
SWAMP|Marsh|plc
SWEAT|Brow moisture, by which man eats bread|ot,thm
SWEEP|Clear with a broom|thm
SWING|Move back and forth|thm
TEETH|Gnashing of them in outer darkness|nt,obj
THEME|Main topic|thm
THICK|Dense|thm
THING|Object|thm
THINK|Ponder|thm
THREW|Cast, as Jonah overboard|thm
THROW|Cast a stone|thm
TIGER|Striped big cat|obj
TITLE|Name of a book|thm
TOAST|Browned bread|obj
TODAY|This very day|thm
TOPIC|Subject|thm
TOTAL|Sum|thm
TOUGH|Hard|thm
TOWEL|Cloth Jesus wrapped around His waist|nt,obj
TRACE|Slight sign|thm
TRACK|Path|thm
TRAIL|Path through the wilderness|thm
TRASH|Rubbish|thm
TREAT|Handle a person|thm
TRIED|Tested|thm
TROOP|Band of soldiers|thm
TRULY|Verily|thm
TRUNK|Tree's main stem|obj
TUTOR|Private teacher|thm
TWIST|Turn|thm
UNCLE|Parent's brother|thm
UNION|Joining|thm
UNITE|Join together|thm
UPSET|Distressed|thm
URBAN|Of the city|thm
USAGE|Habit of use|thm
USUAL|Customary|thm
VALID|Sound|thm
VAULT|Underground chamber|obj
VISIT|Go to see|thm
VITAL|Essential|thm
VOCAL|Of the voice|thm
WASTE|Squander|thm
WEIRD|Strange|thm
WHOLE|Complete, like the man made so|nt,thm
WIDTH|Breadth|thm
WORRY|Be anxious|nt,thm
WORSE|Less good|thm
WORST|Least good|thm
WRIST|Hand's joint|obj
ABROAD|In foreign lands|thm
ACCEPT|Receive willingly|thm
ADVICE|Counsel|thm
AFFAIR|Matter|thm
ALMOND|Aaron's rod bore this nut|ot,obj
ANSWER|Reply|thm
ARTIST|Painter or sculptor|thm
BEFORE|Prior to|thm
BEHIND|At the back of|thm
BELIEF|Faith|thm
BESIDE|Next to|thm
BOTTLE|Skin container for wine|obj
BRIDGE|Span over a river|obj
BROKEN|Shattered|thm
BUCKET|Pail|obj
BUNDLE|Wrapped bunch|obj
CALLED|Summoned|thm
CASTLE|Fortress|plc
CENTER|Middle|thm
CLEVER|Smart|thm
CLOSET|Where to pray in secret|nt,obj
COLUMN|Pillar|obj
COMING|Arriving|thm
COMMON|Ordinary|thm
COUSIN|Elizabeth was Mary's|nt,thm
CRISIS|Time of danger|thm
DAMAGE|Harm|thm
DANGER|Peril|thm
DECIDE|Make up one's mind|thm
DEFEAT|Overcome|thm
DEFEND|Protect|thm
DETAIL|Small point|thm
DEVOTE|Give oneself to|thm
DINNER|Evening meal|thm
DIRECT|Guide|thm
DREAMS|Visions of the night|thm
EITHER|One or the other|thm
ENGAGE|Employ|thm
ESCAPE|Flee|thm
EXPERT|Skilled person|thm
FABRIC|Cloth|obj
FIGURE|Shape|thm
FLAVOR|Taste|thm
FORMER|Earlier|thm
FOSTER|Nurture|thm
FUTURE|What is to come|thm
GIVING|Offering|thm
GUILTY|Deserving blame|thm
HANDLE|Grip|thm
HEIGHT|Elevation|thm
HIDDEN|Concealed|thm
HOLLOW|Empty inside|thm
HONEST|Truthful|thm
INSIDE|Within|thm
INSIST|Demand firmly|thm
INTENT|Purpose|thm
LESSON|Teaching|thm
LETTER|Epistle|nt,thm
LONELY|Alone|thm
MARKET|Place of trade|plc
MEMBER|Part of the body of Christ|nt,thm
MEMORY|Remembrance|thm
MIDDLE|Centre|thm
MIRROR|Looking glass|obj
MOTION|Movement|thm
NEARBY|Close at hand|thm
NOTICE|Observe|thm
OBTAIN|Get|thm
OFFICE|Position of duty|thm
PERIOD|Span of time|thm
PERSON|Individual|thm
POCKET|Small pouch|obj
POETRY|Verse|thm
POLISH|Make shine|thm
POWDER|Fine dust|thm
PRETTY|Fair|thm
PUBLIC|Open to all|thm
RATHER|Preferably|thm
REMAIN|Stay|thm
REMOTE|Far away|thm
REPEAT|Say again|thm
RESULT|Outcome|thm
RETURN|Come back|thm
RIBBON|Narrow band of cloth|obj
RIGHTS|Entitlements|thm
SADDLE|Seat on a donkey|obj
SCHEME|Plot|thm
SEEING|Looking|thm
SELECT|Choose|thm
SENIOR|Elder|thm
SERIES|Sequence|thm
SETTLE|Establish a home|thm
SINGER|Choir member|thm
SLEEVE|Arm covering|obj
SLIGHT|Small|thm
SLOWLY|Not fast|thm
SMOOTH|Not rough|thm
SOURCE|Spring or fountain|thm
SPEECH|Address|thm
SPLASH|Scatter water|thm
SPREAD|Extend|thm
SQUARE|Four-sided shape|thm
STATUE|Image in the king's dream|ot,obj
STEADY|Firm|thm
STOLEN|Taken by a thief|thm
STRESS|Pressure|thm
STRICT|Severe|thm
STRING|Harp cord|obj
SUDDEN|Without warning|thm
SUMMIT|Mountain top|plc
SURELY|Without doubt|thm
SWITCH|Change|thm
TABLET|Stone for the law|ot,obj
TARGET|Aim|thm
THRIVE|Flourish|thm
TOWARD|In the direction of|thm
TRAVEL|Journey|thm
TREATY|Agreement between nations|thm
TRIBAL|Of a clan|thm
TUMBLE|Fall|thm
TWENTY|Score|thm
UNABLE|Not capable|thm
UNLESS|If not|thm
UNLOCK|Open with a key|thm
UNREST|Disturbance|thm
UPHOLD|Support|thm
UPWARD|Toward the sky|thm
URGENT|Pressing|thm
VICTIM|One who suffers harm|thm
VOLUME|Book|thm
WARMTH|Gentle heat|thm
WEAVER|One who makes cloth|thm
WEEKLY|Every seven days|thm
WEIGHT|Heaviness|thm
WISELY|Prudently|thm
WITHIN|Inside|thm
WORKER|Labourer|nt,thm
WRITER|Scribe|thm
YELLOW|Colour of gold|thm
`;

export const EVENT_TAGS = ['xmas', 'east', 'pent', 'hero', 'psalm'];

export function parseBank(raw = RAW) {
  const out = [];
  raw.split('\n').forEach((line) => {
    line = line.trim();
    if (!line) return;
    const [a, c = '', tags = '', e = ''] = line.split('|');
    if (!/^[A-Z]{1,9}$/.test(a)) { console.warn('bad answer', a); return; }
    out.push({ id: out.length, a, c, e, tags: tags.split(',').filter(Boolean) });
  });
  return out;
}

export const BANK = parseBank();
