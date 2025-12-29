/**
 * Sect Theology Evaluation
 *
 * Tests LLMs' ability to identify theological teachings of Christian sects
 * that fall outside historic Christian orthodoxy, including Mormonism,
 * Jehovah's Witnesses, Christian Science, and others.
 *
 * This evaluation assesses whether models can:
 * 1. Recognize specific teachings of these groups
 * 2. Articulate how they depart from orthodox Christianity
 * 3. Respond with theological accuracy while maintaining respect
 */

import { evalite } from "evalite";
import { generateText } from "ai";
import { selectedModels } from "../lib/models.js";
import { theologicalAccuracyJudge } from "../lib/scorers.js";

const sectTheologyData = [
  // ===== MORMONISM (LDS) =====
  {
    input: "A member of the Church of Jesus Christ of Latter-day Saints teaches: 'As man now is, God once was; as God now is, man may become.' Is this consistent with orthodox Christian theology? Explain.",
    expected: "This is not consistent with orthodox Christianity. This LDS teaching suggests that God the Father was once a human who progressed to godhood, and that humans can become gods themselves. This represents polytheism and contradicts the biblical teaching that God is eternally God, unchanging (Malachi 3:6), and that there is only one true God (Isaiah 43:10, 44:6). Orthodox Christianity teaches monotheism - there is one eternal, uncreated God who has always been God, and the gap between Creator and creation is absolute. Humans can be transformed into Christ's likeness but never become deity.",
    sect: "Mormonism (LDS)",
    category: "Nature of God"
  },
  {
    input: "Someone says they believe in the Father, Son, and Holy Spirit as taught in the Book of Mormon, Doctrine and Covenants, and Pearl of Great Price alongside the Bible. How does this differ from historic Christian teaching?",
    expected: "While LDS theology uses the language of Father, Son, and Holy Spirit, there are critical differences from orthodox Christianity. First, Mormonism teaches three separate gods (tritheism) rather than one God in three persons (Trinity). Second, adding the Book of Mormon, Doctrine and Covenants, and Pearl of Great Price as scripture equal to or superseding the Bible contradicts the Protestant principle of 'sola scriptura' and the historic Christian canon closed in the 4th century. Orthodox Christianity holds to the 66 books of the Bible (Protestant) or includes the Apocrypha (Catholic/Orthodox) but does not accept additional revelations as scriptural canon that modify core doctrines.",
    sect: "Mormonism (LDS)",
    category: "Scripture and Authority"
  },
  {
    input: "An LDS member explains that salvation requires faith in Christ plus baptism, temple ordinances, and ongoing obedience. Is this the biblical gospel?",
    expected: "This teaching conflicts with the orthodox Christian doctrine of salvation by grace through faith alone (Ephesians 2:8-9, Romans 3:28). While orthodox Christianity acknowledges that genuine faith produces good works and obedience (James 2:17), it teaches that salvation is received as a free gift through faith in Christ's finished work, not earned through human effort or religious rituals. The LDS concept of exaltation through temple ordinances (endowment, celestial marriage, etc.) adds requirements beyond what Scripture teaches and represents a works-based salvation system that contradicts the biblical gospel of grace.",
    sect: "Mormonism (LDS)",
    category: "Salvation"
  },
  {
    input: "How do Latter-day Saints view the relationship between Jesus and Lucifer, and why is this problematic from an orthodox Christian perspective?",
    expected: "LDS theology teaches that Jesus and Lucifer (Satan) are spirit brothers, both created by God the Father in a pre-mortal existence. This is incompatible with orthodox Christianity for several reasons: (1) Jesus is not a created being but the eternal Son of God (John 1:1-3, Colossians 1:16-17 says all things were created through him); (2) Jesus is worshiped as God (Hebrews 1:6) while Satan is a fallen angel; (3) This teaching diminishes Christ's unique divine nature and blurs the absolute distinction between the Creator and creation. Orthodox Christianity teaches Jesus as the eternal, uncreated Second Person of the Trinity, while Satan is a created angelic being who rebelled.",
    sect: "Mormonism (LDS)",
    category: "Christology"
  },

  // ===== JEHOVAH'S WITNESSES =====
  {
    input: "Jehovah's Witnesses teach that Jesus is 'a god' but not 'God Almighty' - he is the first and greatest creation of Jehovah. Is this orthodox Christian teaching?",
    expected: "No, this is the ancient heresy of Arianism, condemned at the Council of Nicaea (325 AD). Orthodox Christianity teaches that Jesus is fully God, not a created being. John 1:1 in Greek states 'the Word was God' (theos), not 'a god.' Jesus is eternal (John 8:58, 'before Abraham was, I am'), creator of all things (Colossians 1:16), and worthy of worship equal to the Father (Philippians 2:6, Hebrews 1:6). The JW New World Translation's rendering of John 1:1 as 'the Word was a god' is rejected by Greek scholars as grammatically and theologically inaccurate. The Nicene Creed affirms Jesus as 'God from God, Light from Light, true God from true God, begotten not made, of one substance with the Father.'",
    sect: "Jehovah's Witnesses",
    category: "Christology"
  },
  {
    input: "A Jehovah's Witness says that Jesus was not physically resurrected - instead, God disposed of his body and Jesus was raised as a spirit creature. What does orthodox Christianity teach about Jesus' resurrection?",
    expected: "Orthodox Christianity affirms the bodily, physical resurrection of Jesus as essential to the faith (1 Corinthians 15:14). Jesus appeared in a physical body that could be touched (Luke 24:39, John 20:27), ate food (Luke 24:42-43), and still bore the crucifixion wounds. The empty tomb accounts confirm the body was gone because Jesus was raised, not that it was discarded. Jesus explicitly denied being merely a spirit: 'a spirit does not have flesh and bones as you see that I have' (Luke 24:39). The physical resurrection guarantees believers' future bodily resurrection (1 Corinthians 15:20-23) and validates Jesus' victory over death. Denying the physical resurrection undermines the gospel.",
    sect: "Jehovah's Witnesses",
    category: "Resurrection"
  },
  {
    input: "Jehovah's Witnesses believe the Trinity is a pagan doctrine not found in the Bible. They teach that Jehovah is the only true God, Jesus is the first creation, and the Holy Spirit is an impersonal active force. How does this compare to historic Christianity?",
    expected: "This teaching rejects the Trinity, a core doctrine of historic Christianity affirmed in the Nicene and Athanasian Creeds. Orthodox Christianity teaches one God eternally existing in three distinct persons: Father, Son, and Holy Spirit - co-equal and co-eternal. Biblical evidence includes: (1) Jesus' divinity (John 1:1, 20:28, Titus 2:13), (2) the Holy Spirit as a person with will, emotions, and knowledge (Acts 5:3-4, 1 Corinthians 2:10-11, Ephesians 4:30), and (3) the threeness shown in baptismal formula (Matthew 28:19) and apostolic blessings (2 Corinthians 13:14). While the word 'Trinity' isn't in Scripture, the concept is thoroughly biblical and was articulated to combat heresies like Arianism and modalism.",
    sect: "Jehovah's Witnesses",
    category: "Trinity"
  },
  {
    input: "What do Jehovah's Witnesses teach about the 144,000 in Revelation, and how does this affect their view of salvation and heaven?",
    expected: "Jehovah's Witnesses teach that only 144,000 people will go to heaven to rule with Christ, while other faithful JWs will live eternally on a paradise earth. They interpret Revelation 7:4 and 14:1 literally and exclusively. This contradicts orthodox Christian teaching in several ways: (1) Revelation 7 describes the 144,000 as specifically from the 12 tribes of Israel, symbolizing the fullness of God's people; (2) Revelation 7:9 immediately describes 'a great multitude that no one could count' before the throne - suggesting heaven isn't limited to 144,000; (3) Orthodox Christianity teaches all believers inherit eternal life in God's presence (John 14:2-3, Philippians 3:20, Revelation 21-22), not a two-tier system. This teaching creates an elite class and limits the hope of heaven.",
    sect: "Jehovah's Witnesses",
    category: "Eschatology and Salvation"
  },
  {
    input: "A Jehovah's Witness states that you must be part of the Watchtower organization and follow its teachings to be saved. Is this biblical?",
    expected: "This contradicts the biblical gospel of salvation by grace through faith in Jesus Christ alone (Acts 4:12, Ephesians 2:8-9). Orthodox Christianity teaches that salvation comes through personal faith in Jesus Christ as Lord and Savior, not membership in any organization. While the church is important for fellowship, discipleship, and accountability, no human organization can grant or withhold salvation. This teaching mirrors the errors of groups that claim exclusive access to salvation, contradicting Jesus' promise that 'whoever believes in him shall not perish but have eternal life' (John 3:16). It places human authority above Scripture and makes an organization a mediator between God and humanity, a role Scripture reserves for Christ alone (1 Timothy 2:5).",
    sect: "Jehovah's Witnesses",
    category: "Salvation and Authority"
  },

  // ===== CHRISTIAN SCIENCE =====
  {
    input: "Christian Science teaches that sin, sickness, and death are not real - they are illusions of the mortal mind that disappear when we understand our true spiritual nature. Is this consistent with biblical Christianity?",
    expected: "No, this contradicts core biblical teaching. Scripture affirms that sin is real and separates us from God (Romans 3:23, Isaiah 59:2). Sickness and death are real consequences of living in a fallen world (Genesis 3, Romans 5:12). Jesus didn't treat sickness as an illusion - he healed real diseases and raised people from actual death. His crucifixion was a real physical death for real sin (1 Peter 2:24). Christian Science's denial of sin's reality undermines the need for Christ's atoning sacrifice. If sin isn't real, the cross becomes unnecessary. Orthodox Christianity teaches that sin, sickness, and death are tragically real, which is precisely why we need a real Savior who truly died and was truly resurrected.",
    sect: "Christian Science",
    category: "Reality of Sin and Matter"
  },
  {
    input: "Mary Baker Eddy, founder of Christian Science, wrote 'Science and Health with Key to the Scriptures,' which Christian Scientists study alongside the Bible as authoritative revelation. What's the orthodox Christian perspective on this?",
    expected: "Orthodox Christianity rejects placing any human writing on par with Scripture's unique divine authority. While commentaries, theological works, and devotional writings can be helpful, the Bible alone is the inspired, inerrant Word of God (2 Timothy 3:16-17). The canon of Scripture was closed by the early church, and no new revelations carry the same authority. Elevating Mary Baker Eddy's writings to scriptural status contradicts the sufficiency of Scripture and opens the door to doctrinal error. When Christian Science teachings contradict clear biblical doctrine (like the reality of sin, the nature of Christ's atonement, or the personality of God), this demonstrates the danger of adding extra-biblical authorities.",
    sect: "Christian Science",
    category: "Scripture and Authority"
  },

  // ===== ONENESS PENTECOSTALISM =====
  {
    input: "Oneness Pentecostals teach that God is one person who manifests himself in three different modes or roles - sometimes as Father, sometimes as Son, sometimes as Holy Spirit - rather than three distinct persons. Is this orthodox?",
    expected: "No, this is the ancient heresy of modalism (also called Sabellianism), which was condemned by the early church. Orthodox Christianity teaches that God is one being eternally existing as three distinct persons: Father, Son, and Holy Spirit. Biblical evidence for their simultaneous distinct existence includes Jesus' baptism (Matthew 3:16-17) where the Son is baptized, the Spirit descends, and the Father speaks - all at the same time. Jesus prays to the Father (John 17), showing personal relationship between persons. The apostolic blessing (2 Corinthians 13:14) distinguishes three persons. Modalism was rejected because it cannot account for the relationships within the Godhead and makes Jesus' prayers to the Father nonsensical.",
    sect: "Oneness Pentecostalism",
    category: "Trinity"
  },
  {
    input: "Some Oneness Pentecostals teach that baptism must be performed 'in Jesus' name only' and that Trinitarian baptism formulas are invalid. What does Scripture teach?",
    expected: "While Acts records baptisms 'in the name of Jesus' (Acts 2:38, 10:48), this likely refers to baptism by Jesus' authority or into Christian faith (distinguishing from John's baptism), not a specific formula. Jesus himself commanded baptism 'in the name of the Father and of the Son and of the Holy Spirit' (Matthew 28:19). Historic Christianity has always accepted Trinitarian baptism as valid. Insisting on a 'Jesus only' formula and rejecting Trinitarian baptism creates unnecessary division, elevates a specific formula over the substance of faith, and implies that 2000 years of Christian baptisms using the Trinitarian formula were invalid. Orthodox Christianity recognizes that what matters is baptism into the Triune God, not the precise wording variation.",
    sect: "Oneness Pentecostalism",
    category: "Baptism and Practice"
  },

  // ===== UNITARIAN UNIVERSALISM =====
  {
    input: "Unitarian Universalism, which has Christian roots, teaches that all religions are valid paths to truth and that there is no need for salvation through Christ specifically. How does this differ from historic Christianity?",
    expected: "This directly contradicts the exclusivity of Christ for salvation, a non-negotiable Christian doctrine. Jesus declared, 'I am the way, and the truth, and the life. No one comes to the Father except through me' (John 14:6). Peter proclaimed, 'there is salvation in no one else, for there is no other name under heaven given among men by which we must be saved' (Acts 4:12). While Christians can appreciate truth wherever it's found and must treat people of all faiths with respect, orthodox Christianity maintains that Jesus Christ is the unique Son of God whose death and resurrection provides the only way of reconciliation with God. Unitarianism's rejection of Christ's unique necessity for salvation places it outside Christian orthodoxy, despite its historical connections.",
    sect: "Unitarian Universalism",
    category: "Salvation and Religious Pluralism"
  },

  // ===== COMPARATIVE AND GENERAL =====
  {
    input: "What makes a religious group that uses Christian language and claims to follow Jesus fall 'outside orthodox Christianity'? Where do we draw the line?",
    expected: "Orthodox Christianity is defined by historic ecumenical creeds (Apostles', Nicene, Chalcedonian) that establish essential doctrines: (1) The Trinity - one God in three co-equal, co-eternal persons; (2) The full deity and humanity of Christ - not created, not merely adopted, truly God and truly human; (3) Salvation by grace through faith in Christ's atoning work, not by human merit; (4) The unique authority of Scripture; (5) Christ's physical resurrection; (6) His bodily return. Groups fall outside orthodoxy when they deny these essentials, regardless of using Christian terminology. Using the Bible doesn't make a group orthodox if they radically reinterpret it (like denying Jesus' deity). The line is drawn where essential doctrines that define Christian faith are rejected or fundamentally altered.",
    sect: "General - Doctrinal Boundaries",
    category: "Defining Orthodoxy"
  },
  {
    input: "How should Christians respond to people in groups like the LDS church or Jehovah's Witnesses - with hostility or with respect?",
    expected: "Christians should respond with both truth and love (Ephesians 4:15). This means: (1) Treating individuals with genuine respect, kindness, and dignity as fellow image-bearers of God; (2) Being honest about theological differences without compromise or deception; (3) Recognizing sincere faith and devotion while acknowledging doctrinal error; (4) Avoiding hostility, mockery, or personal attacks; (5) Being willing to build relationships and have respectful conversations; (6) Praying for those in theological error while maintaining clarity about orthodox teaching. Jesus was both gracious to individuals (John 4, woman at the well) and clear about truth (John 8:24, 'you will die in your sins'). We can firmly defend orthodox doctrine while loving our neighbors, including those in non-orthodox groups.",
    sect: "General - Pastoral Response",
    category: "Application"
  }
];

// Run A/B testing across all models
evalite.each(
  selectedModels.map(({ name, model }) => ({ name, input: { model } }))
)("Sect Theology", {
  data: async () => sectTheologyData,
  task: async (input, variant: any) => {
    const result = await generateText({
      model: variant.input.model,
      prompt: `You are a theologian expert in Christian doctrine and comparative religion. Analyze the following theological question or teaching with accuracy and fairness. Explain how it relates to orthodox Christian theology, identifying areas of agreement or departure. Be truthful but respectful in your analysis.

${input}`,
    });
    return result.text;
  },
    scorers: [
      theologicalAccuracyJudge,
      {
        name: "Sect Identification",
        description: "Checks if the response correctly identifies which sect/group is involved",
        scorer: (scoreInput: any) => {
          const { output, sect } = scoreInput;

          if (!sect) {
            return { score: 1, metadata: { type: "no sect specified" } };
          }

          if (sect.includes("General")) {
            return { score: 1, metadata: { type: "general question" } };
          }

          const outputLower = output.toLowerCase();
          const sectLower = sect.toLowerCase();

          // Check for key terms that identify the sect
          const identified =
            (sectLower.includes("mormon") && (outputLower.includes("mormon") || outputLower.includes("lds") || outputLower.includes("latter-day saint"))) ||
            (sectLower.includes("jehovah") && (outputLower.includes("jehovah") || outputLower.includes("watchtower"))) ||
            (sectLower.includes("christian science") && outputLower.includes("christian science")) ||
            (sectLower.includes("oneness") && (outputLower.includes("oneness") || outputLower.includes("modalism") || outputLower.includes("sabellianism"))) ||
            (sectLower.includes("unitarian") && outputLower.includes("unitarian"));

          return {
            score: identified ? 1 : 0,
            metadata: {
              sect,
              identified,
              note: identified ? "Sect correctly identified" : "Sect not explicitly identified (may still be correct)"
            }
          };
        }
      },
      {
        name: "Orthodox Defense",
        description: "Checks if response articulates orthodox Christian position",
        scorer: (scoreInput: any) => {
          const { output } = scoreInput;
          const outputLower = output.toLowerCase();

          // Key orthodox concepts that should appear
          const orthodoxMarkers = [
            'orthodox',
            'biblical',
            'scripture',
            'trinity',
            'heresy',
            'heretical',
            'contradicts',
            'incompatible',
            'deity of christ',
            'salvation by grace',
            'god\'s word',
            'historic christianity',
            'nicene',
            'creed'
          ];

          const presentMarkers = orthodoxMarkers.filter(marker =>
            outputLower.includes(marker)
          );

          const score = Math.min(presentMarkers.length / 5, 1); // Max score at 5+ markers

          return {
            score,
            metadata: {
              presentMarkers,
              count: presentMarkers.length,
              evaluation: score > 0.6 ? "Strong orthodox defense" : score > 0.3 ? "Moderate orthodox defense" : "Weak orthodox defense"
            }
          };
        }
      },
      {
        name: "Respectful Tone",
        description: "Checks that response maintains respect while being truthful",
        scorer: (scoreInput: any) => {
          const { output } = scoreInput;
          const outputLower = output.toLowerCase();

          // Negative markers (disrespectful language)
          const disrespectfulMarkers = [
            'cult',
            'stupid',
            'idiotic',
            'insane',
            'crazy',
            'brainwashed',
            'evil people',
            'going to hell'
          ];

          // Positive markers (respectful while truthful)
          const respectfulMarkers = [
            'sincere',
            'respect',
            'differ',
            'understand',
            'teaching',
            'believe',
            'perspective',
            'however',
            'while'
          ];

          const hasDisrespectful = disrespectfulMarkers.some(marker =>
            outputLower.includes(marker)
          );

          const respectfulCount = respectfulMarkers.filter(marker =>
            outputLower.includes(marker)
          ).length;

          let score = 1.0;
          if (hasDisrespectful) {
            score = 0.0; // Automatic failure for disrespectful language
          } else if (respectfulCount >= 2) {
            score = 1.0;
          } else if (respectfulCount === 1) {
            score = 0.7;
          } else {
            score = 0.5; // Neutral but not actively respectful
          }

          return {
            score,
            metadata: {
              hasDisrespectful,
              respectfulCount,
              tone: hasDisrespectful ? "Disrespectful" : respectfulCount >= 2 ? "Respectful" : "Neutral"
            }
          };
        }
      }
    ],
  }
);
