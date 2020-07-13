[![Maintainability](https://api.codeclimate.com/v1/badges/b46309f0a4f2dc35c13f/maintainability)](https://codeclimate.com/github/fockl/MOCA/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/b46309f0a4f2dc35c13f/test_coverage)](https://codeclimate.com/github/fockl/MOCA/test_coverage)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/fockl/MOCA/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/fockl/MOCA/?branch=master)
[![Build Status](https://scrutinizer-ci.com/g/fockl/MOCA/badges/build.png?b=master)](https://scrutinizer-ci.com/g/fockl/MOCA/build-status/master)
[![GitHub issues](https://img.shields.io/github/issues/fockl/MOCA)](https://github.com/fockl/MOCA/issues)
[![GitHub forks](https://img.shields.io/github/forks/fockl/MOCA)](https://github.com/fockl/MOCA/network)
[![GitHub stars](https://img.shields.io/github/stars/fockl/MOCA)](https://github.com/fockl/MOCA/stargazers)
[![GitHub license](https://img.shields.io/github/license/fockl/MOCA)](https://github.com/fockl/MOCA/blob/master/LICENSE)
[![Twitter](https://img.shields.io/twitter/url?url=https%3A%2F%2Fgithub.com%2Ffockl%2FMOCA?style=social)](https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Ffockl%2FMOCA)

# MOCA

Monte Carlo Simulator

![result](https://user-images.githubusercontent.com/12505784/87247623-f3ed3d00-c48f-11ea-96a9-df5349320287.gif)

# Table of Contents

- [Installation](#Installation)
- [Usage](#Usage)
- [License](#Lisence)
- [Link](#Link)
- [References](#References)



## Installation

The only thing you have to do to use MOCA is the following 3 step:

```bash
$ git clone https://github.com/fockl/MOCA.git
$ cd MOCE
$ open index.html
```

If you want to use MOCA without downloading, go [HERE](https://fockl.github.io/MOCA/index.html)

## Usage

You can manage some parameters.

+ **Inverse temperature**

  You can choose the inverse temperature $\beta$ between 0 and 1 with a slide bar or by setting numbers

+ **Size**

  You can select any length of the square by this parameter. Note that the more large size you choose, the more time to draw the spins and calculate the update is required.

+ **Shape**

  You can select the form of the spins drawn in the square. "Arrow" shows the arrow shape, and "Block" shows the block shape. In both cases, you can check the directions of spins by their colors. (Block shapes take less time to be drawn than Arrow shapes)

+ **Model**

  You can choose one of the following models :

  + Ising model:
    
    <center><img src="https://latex.codecogs.com/gif.latex?\mathcal{H}&space;=&space;-&space;\sum_{\langle&space;ij&space;\rangle}&space;s_i&space;s_j" title="\mathcal{H} = - \sum_{\langle ij \rangle} s_i s_j" /></center>
    

    
  + XY model:
    
    <center><img src="https://latex.codecogs.com/gif.latex?\mathcal{H}&space;=&space;-&space;\sum_{\langle&space;ij&space;\rangle}&space;\cos(\theta_i&space;-&space;\theta_j)" title="\mathcal{H} = - \sum_{\langle ij \rangle} \cos(\theta_i - \theta_j)" /></center>

+ **Update**
  
  You can select the update algorithm:
  
  + Local update:
  
    In the local update, a heat-bath update is used in the Ising model because of the educational reason at $\beta = 0$. In the XY model, a similar purpose, Meslopolis-like heat-bath update (randomly choose the next angle, and update with heat bath probability) is used.
  
  + Wolff update:
  
    In the Wolff update, you can use the Wolff algorithm in Ising and XY models.
  
    see [Comparison between cluster Monte Carlo algorithms in the Ising model](https://www.sciencedirect.com/science/article/abs/pii/0370269389915633)
  
    or [Collective Monte Carlo Updating for Spin Systems](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.62.361)
  
  + Event-chain update (XY model only):
  
    In the XY model, you can use the Event-chain update.
  
    see [Event-chain Monte Carlo for classical continuous spin models](https://iopscience.iop.org/article/10.1209/0295-5075/112/20003/meta)
  
    or [Event-chain Monte Carlo for classical continuous spin models (arXiv)](https://arxiv.org/pdf/1508.06541.pdf)



## License

[MIT](https://choosealicense.com/licenses/mit/)



## Link



MOCA's page is [HERE](https://fockl.github.io/MOCA/index.html)



## References

U. Wolff, Comparison between cluster Monte Carlo algorithms in the Ising model, Physics Letters B **228**, 379 (1989). https://www.sciencedirect.com/science/article/abs/pii/0370269389915633

U. Wolff, Collective Monte Carlo Updating for Spin Systems, Phys. Rev. Lett. **62**, 361 (1989). https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.62.361

M. Michel, J. Mayer, W. Krauth, Event-chain Monte Carlo for classical continuous spin models, Europhys. Lett. **112**, 2 (2015). https://iopscience.iop.org/article/10.1209/0295-5075/112/20003/meta

M. Michel, J. Mayer, W. Krauth, Event-chain Monte Carlo for classical continuous spin models, arXiv:1508.06541 https://arxiv.org/pdf/1508.06541.pdf

