import { Syringe } from '../src'
import { TestApp } from './app'

Syringe.inject(TestApp)
Syringe.Container.destroyAllInstances()
